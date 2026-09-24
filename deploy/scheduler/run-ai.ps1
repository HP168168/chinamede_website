<#
  AI 内容工厂批量生成入口（Windows 任务计划 / 手动调用）

  作用：
    调用 cms 目录下的 AI 内容工厂 CLI，批量处理后台「生成任务」中状态为「待处理」的条目，
    成功后写入文章草稿（不会自动上线），过程全程落日志。

  常用方式：
    # 批量：按 cms/.env 的 AI_DAILY_LIMIT 篇数执行
    powershell -ExecutionPolicy Bypass -File deploy\scheduler\run-ai.ps1

    # 批量：本轮最多 2 篇
    powershell -ExecutionPolicy Bypass -File deploy\scheduler\run-ai.ps1 -Limit 2

    # 手动单篇：指定任务的 documentId（在后台生成任务详情页链接中可见）
    powershell -ExecutionPolicy Bypass -File deploy\scheduler\run-ai.ps1 -Mode once -TaskId abc123xyz

    # 环境自检（Strapi / Token / 模型 / 知识库）与提示词预览（不调用模型）
    powershell -ExecutionPolicy Bypass -File deploy\scheduler\run-ai.ps1 -Mode check
    powershell -ExecutionPolicy Bypass -File deploy\scheduler\run-ai.ps1 -Mode preview -Topic "2026短视频剪辑岗位前景"

  配合任务计划：
    schtasks /Create /TN "Meidi\AI-Content-Factory" /XML deploy\scheduler\task-scheduler.xml
    （导入前把 XML 里的路径改成实际部署路径）

  退出码：
    0 全部成功；非 0 表示存在失败任务或环境异常（任务计划里可据此告警）。
#>
[CmdletBinding()]
param(
  # run（默认，批量）/ once（单篇）/ preview（只打印提示词）/ check（自检）
  [ValidateSet('run', 'once', 'preview', 'check')]
  [string]$Mode = 'run',

  # 本轮最多生成篇数；0 表示使用 cms/.env 中的 AI_DAILY_LIMIT
  [int]$Limit = 0,

  # Mode=once / preview 时指定生成任务的 documentId
  [string]$TaskId,

  # Mode=preview 且未建任务时直接预览的选题
  [string]$Topic,

  # 演练：调用模型与校验但不写入后台
  [switch]$DryRun
)

$ErrorActionPreference = 'Continue'

# 本脚本位于 <仓库根>/deploy/scheduler，向上两级即仓库根
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$CmsDir = Join-Path $RepoRoot 'cms'
$LogDir = Join-Path $CmsDir '.tmp\logs'
$LogFile = Join-Path $LogDir ('ai-run-{0}.log' -f (Get-Date -Format 'yyyyMMdd'))

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

function Write-Log {
  param([string]$Message)
  $line = '[{0}] {1}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $Message
  Write-Host $line
  Add-Content -Path $LogFile -Value $line -Encoding utf8
}

if (-not (Test-Path (Join-Path $CmsDir 'package.json'))) {
  Write-Log "找不到 cms 工程目录：$CmsDir"
  exit 1
}

if (-not (Test-Path (Join-Path $CmsDir '.env'))) {
  Write-Log '缺少 cms/.env：请先复制 cms/.env.example 并填好数据库、Token 与 AI 密钥'
  exit 1
}

$npm = Get-Command npm.cmd -ErrorAction SilentlyContinue
if (-not $npm) { $npm = Get-Command npm -ErrorAction SilentlyContinue }
if (-not $npm) {
  Write-Log '未找到 npm：请确认已安装 Node.js LTS 且加入 PATH'
  exit 1
}

$arguments = @('run', "ai:$Mode", '--')
switch ($Mode) {
  'run' {
    if ($Limit -gt 0) { $arguments += @('--limit', "$Limit") }
    if ($DryRun) { $arguments += '--dry-run' }
  }
  'once' {
    if (-not $TaskId) {
      Write-Log 'Mode=once 需要同时提供 -TaskId <生成任务 documentId>（后台生成任务详情页可见）'
      exit 1
    }
    $arguments += @('--task', $TaskId)
  }
  'preview' {
    if ($TaskId) { $arguments += @('--task', $TaskId) }
    if ($Topic) { $arguments += @('--topic', $Topic) }
  }
  default { }
}

Write-Log ("开始执行：npm {0}（工作目录 {1}）" -f ($arguments -join ' '), $CmsDir)

if ($Limit -gt 0) { Write-Log "本轮上限：$Limit 篇" }

Push-Location $CmsDir
try {
  $output = & $npm.Source @arguments 2>&1 | Out-String
  $exitCode = $LASTEXITCODE
} finally {
  Pop-Location
}

if ($output) { Add-Content -Path $LogFile -Value $output.TrimEnd() -Encoding utf8 }

if ($exitCode -ne 0) {
  Write-Log "执行结束：存在失败任务或环境异常（退出码 $exitCode），详见 $LogFile"
} else {
  Write-Log '执行结束：全部成功'
}

exit $exitCode
