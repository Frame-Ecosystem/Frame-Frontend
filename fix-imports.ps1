Set-Location "c:\Users\abbas\Desktop\FRAME\Frame Front"

$changed = 0
$files = Get-ChildItem -Path "app\_systems","app\_core" -Recurse -Include "*.ts","*.tsx"

foreach ($file in $files) {
    $path = $file.FullName
    $content = Get-Content $path -Raw -Encoding UTF8
    $original = $content

    # 1. ui/ replacements (depth-aware)
    if ($path -like "*\_core\components\*") {
        $content = [regex]::Replace($content, "(['""])(\.\./)+ui/", '$1@/app/_core/ui/')
        $content = [regex]::Replace($content, "(['""])(\.\./)+skeletons/", '$1@/app/_components/skeletons/')
    }
    elseif ($path -like "*\_systems\*") {
        $content = [regex]::Replace($content, "(['""])(\.\./)+ui/", '$1@/app/_components/ui/')
        $content = [regex]::Replace($content, "(['""])(\.\./)+skeletons/", '$1@/app/_components/skeletons/')
    }

    # 2. Cross-cutting _* folder refs
    $content = [regex]::Replace($content, "(['""])(\.\./)+_types(/[^'""]*)?(['""])", '$1@/app/_types$3$4')
    $content = [regex]::Replace($content, "(['""])(\.\./)+_services(/[^'""]*)?(['""])", '$1@/app/_services$3$4')
    $content = [regex]::Replace($content, "(['""])(\.\./)+_hooks(/[^'""]*)?(['""])", '$1@/app/_hooks$3$4')
    $content = [regex]::Replace($content, "(['""])(\.\./)+_i18n(/[^'""]*)?(['""])", '$1@/app/_i18n$3$4')
    $content = [regex]::Replace($content, "(['""])(\.\./)+_lib(/[^'""]*)?(['""])", '$1@/app/_lib$3$4')
    $content = [regex]::Replace($content, "(['""])(\.\./)+_constants(/[^'""]*)?(['""])", '$1@/app/_constants$3$4')
    $content = [regex]::Replace($content, "(['""])(\.\./)+_providers(/[^'""]*)?(['""])", '$1@/app/_providers$3$4')
    $content = [regex]::Replace($content, "(['""])(\.\./)+_components(/[^'""]*)?(['""])", '$1@/app/_components$3$4')

    # 3. './api' in services/ -> @/app/_core/api/api
    if ($path -like "*\_systems\*\services\*") {
        $content = [regex]::Replace($content, "(['""])\.\/api(['""])", '$1@/app/_core/api/api$2')
    }

    if ($content -ne $original) {
        Set-Content $path $content -Encoding UTF8 -NoNewline
        $changed++
    }
}

Write-Host "Fixed: $changed files"
