
chcp 936

set watchifyPath="C:\Users\Administrator\AppData\Roaming\npm\watchify.cmd"

%watchifyPath% -o ./release/bundle.js -v ^
	-r ./htm-tool.js:htm-tool ^


pause
