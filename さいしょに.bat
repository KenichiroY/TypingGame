@echo off
chcp 65001 >nul

echo タイピングゲームの初期設定を行います...
echo.

REM ショートカット作成（アイコン付き）
powershell -Command ^
  "$ws = New-Object -ComObject WScript.Shell;" ^
  "$shortcut = $ws.CreateShortcut('%~dp0タイピングゲーム.lnk');" ^
  "$shortcut.TargetPath = '%~dp0index.html';" ^
  "$shortcut.IconLocation = '%~dp0icon.ico,0';" ^
  "$shortcut.WorkingDirectory = '%~dp0';" ^
  "$shortcut.Save()"

echo [OK] ショートカットを作成しました

REM ファイル・フォルダを隠し属性に設定
attrib +h "%~dp0index.html"
attrib +h "%~dp0icon.ico"
attrib +h "%~dp0config"
attrib +h "%~dp0js"
attrib +h "%~dp0css"
attrib +h "%~dp0README.md"
attrib +h "%~dp0LICENSE"

echo [OK] ファイルを非表示にしました


echo.
echo ========================================
echo   初期設定が完了しました！
echo   「タイピングゲーム」をダブルクリックして遊んでください
echo ========================================
echo.
pause

REM 実際に配布するときには下の行のREMを削除する。
REM del %0