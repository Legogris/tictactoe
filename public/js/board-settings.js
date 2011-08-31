if(CM === undefined) { var CM = {}; }

CM.Settings = {
	BackgroundColor: '#000',
	ViewWidth: 600,
	ViewHeight: 600,
	BoardWidth: 600,
	BoardHeight: 600,
	FPS: 25,
	SpritePath: '/img/'
};


if(typeof module != 'undefined') {
    module.exports = CM.Settings;
}