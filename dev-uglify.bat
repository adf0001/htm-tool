
chcp 936

rem set uglifyjs="C:\Users\Administrator\AppData\Roaming\npm\uglifyjs.cmd"
set uglifyjs="C:\Users\Administrator\AppData\Roaming\npm\terser.cmd"

call %uglifyjs% ./release/bundle.js -o ./release/bundle.min.js -c -m

pause
