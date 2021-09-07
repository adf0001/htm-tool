
chcp 936

set watchifyPath="watchify.cmd"

set module=htm-tool

if not exist ./release md release

%watchifyPath% -o ./release/bundle.js -v ^
	-r ./%module%.js:%module%

