
set watchifyPath="watchify.cmd"

set module=htm-tool

title watchify - %module%

if not exist ./debug md debug

for /F %%i in ('npm root -g') do ( set globalModulePath=%%i)

%watchifyPath% -o ./debug/bundle.debug.js -v ^
	-g [ "%globalModulePath%/stringify" --extensions [.html .htm .css ] ] ^
	-r ./package.json:_package_json ^
	-r ./test/test-data.js:_test_data ^
	-r ./%module%.js:%module%

