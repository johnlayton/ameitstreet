var deps = {
	Core: {
		src: [
			'ext/LineUtil.Intersect.js',
			'ext/Polyline.Intersect.js',
			'ext/Polygon.Intersect.js',
			'Tooltip.js',
			'Control.Toolbar.js'
		],
		desc: 'The core of the plugin.'
	},

	Draw: {
		src: [
			'draw/Control.Draw.js',
      'draw/handler/Draw.Feature.js',
      'draw/handler/Draw.SimpleShape.js',
			'draw/handler/Draw.Polyline.js',
			'draw/handler/Draw.Polygon.js',
			'draw/handler/Draw.Circle.js',
			'draw/handler/Draw.Rectangle.js',
			'draw/handler/Draw.Marker.js'
		],
		desc: 'Drawing tools used to create vectors and markers.',
		deps: ['Core']
	},

	Edit: {
		src: [
      'edit/Control.Edit.js',
      'edit/handler/Delete.Feature.js',
      'edit/handler/Edit.Feature.js',
      'edit/handler/Edit.SimpleShape.js',
      'edit/handler/Edit.Circle.js',
      'edit/handler/Edit.Rectangle.js'
		],
		desc: 'Editing tools used to edit and delete vectors and markers.',
		deps: ['Core']
	}
};

if (typeof exports !== 'undefined') {
	exports.deps = deps;
}