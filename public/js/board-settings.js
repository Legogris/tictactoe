if(CM == undefined) { var CM = {} };

CM.Settings = {
	BackgroundColor: '#000',
	ViewWidth: 660,
	ViewHeight: 660,
	BoardWidth: 600,
	BoardHeight: 600,
	FPS: 25,
	SpritePath: '/img/',
	StageBackground: "/img/boardtra2_03.png",
	CowWidth: 50,
	CowHeight: 50
};


if(typeof module != 'undefined') {
    module.exports = CM.Settings;
}