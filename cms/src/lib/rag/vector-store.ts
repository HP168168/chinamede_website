/**
 * 知识库向量表（SQLite，零新增服务）。
 *
 * 为什么不引入向量数据库：项目默认就是 SQLite，且 `better-sqlite3` 已在依赖里；
 * 知识条目规模是「几百条」，全表扫描算余弦相似度完全够用（毫秒级）。
 * 换来的是——不用装 Docker、不用多维护一个进程、备份就是拷一个文件。
 *
 * 独立库文件（cms/.tmp/kb-vectors.db）而非写进 Strapi 主库，
 * 避免与 Strapi 的迁移/事务互相干扰。
 */

import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

export interface VectorChunk {
  entryDocumentId: string;
  entrySlug?: string;
  entryTitle: string;
  chunkIndex: number;
  section: string;
  text: string;
  vector: number[];
  updatedAt: string;
}

export interface StoredChunk extends Omit<VectorChunk, 'vector'> {
  vector: Float32Array;
}

const TABLE = 'kb_chunks';

export class KbVectorStore {
  private constructor(private readonly db: Database.Database) {}

  static open(dbPath: string): KbVectorStore {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });

    const db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.exec(`
      CREATE TABLE IF NOT EXISTS ${TABLE} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entry_document_id TEXT NOT NULL,
        entry_slug TEXT,
        entry_title TEXT NOT NULL,
        chunk_index INTEGER NOT NULL,
        section TEXT NOT NULL,
        text TEXT NOT NULL,
        dim INTEGER NOT NULL,
        vector BLOB NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(entry_document_id, chunk_index)
      );
      CREATE INDEX IF NOT EXISTS idx_kb_chunks_entry ON ${TABLE} (entry_document_id);
    `);

    return new KbVectorStore(db);
  }

  /** 写入或更新一个分片 */
  upsert(chunk: VectorChunk): void {
    const buffer = Buffer.from(new Float32Array(chunk.vector).buffer);

    this.db
      .prepare(
        `INSERT INTO ${TABLE}
           (entry_document_id, entry_slug, entry_title, chunk_index, section, text, dim, vector, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(entry_document_id, chunk_index) DO UPDATE SET
           entry_slug = excluded.entry_slug,
           entry_title = excluded.entry_title,
           section = excluded.section,
           text = excluded.text,
           dim = excluded.dim,
           vector = excluded.vector,
           updated_at = excluded.updated_at`,
      )
      .run(
        chunk.entryDocumentId,
        chunk.entrySlug ?? null,
        chunk.entryTitle,
        chunk.chunkIndex,
        chunk.section,
        chunk.text,
        chunk.vector.length,
        buffer,
        chunk.updatedAt,
      );
  }

  /** 删除某个知识条目的全部分片（条目取消发布 / 删除时调用） */
  deleteByEntry(entryDocumentId: string): void {
    this.db.prepare(`DELETE FROM ${TABLE} WHERE entry_document_id = ?`).run(entryDocumentId);
  }

  clear(): void {
    this.db.prepare(`DELETE FROM ${TABLE}`).run();
  }

  count(): number {
    const row = this.db.prepare(`SELECT COUNT(*) AS total FROM ${TABLE}`).get() as { total: number };
    return row?.total ?? 0;
  }

  /** 全部分片（数据量小，检索时一次性载入内存计算相似度） */
  all(): StoredChunk[] {
    const rows = this.db
      .prepare(
        `SELECT entry_document_id, entry_slug, entry_title, chunk_index, section, text, dim, vector, updated_at
         FROM ${TABLE}`,
      )
      .all() as {
      entry_document_id: string;
      entry_slug: string | null;
      entry_title: string;
      chunk_index: number;
      section: string;
      text: string;
      dim: number;
      vector: Buffer;
      updated_at: string;
    }[];

    return rows.map((row) => ({
      entryDocumentId: row.entry_document_id,
      entrySlug: row.entry_slug ?? undefined,
      entryTitle: row.entry_title,
      chunkIndex: row.chunk_index,
      section: row.section,
      text: row.text,
      vector: new Float32Array(
        row.vector.buffer,
        row.vector.byteOffset,
        row.vector.byteLength / Float32Array.BYTES_PER_ELEMENT,
      ),
      updatedAt: row.updated_at,
    }));
  }

  close(): void {
    this.db.close();
  }
}

/** 打开向量库；失败返回 null（调用方降级到关键词检索） */
export function openKbVectorStore(): KbVectorStore | null {
  const configured = (process.env.KB_VECTOR_DB ?? '').trim();
  const dbPath = configured
    ? path.resolve(configured)
    : path.resolve(__dirname, '..', '..', '..', '.tmp', 'kb-vectors.db');

  try {
    return KbVectorStore.open(dbPath);
  } catch {
    return null;
  }
}
