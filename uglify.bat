
chcp 936

rem set uglifyjs="C:\Users\Administrator\AppData\Roaming\npm\uglifyjs.cmd"
set uglifyjs="C:\Users\Administrator\AppData\Roaming\npm\terser.cmd"

call %uglifyjs% htm-tool.js -o release/htm-tool.min.js -c -m

pause
