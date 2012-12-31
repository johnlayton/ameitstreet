L.Draw.Polygon = L.Draw.Polyline.extend({
	statics: {
		TYPE: 'polygon'
	},

	Poly: L.Polygon,

	options: {
    name: 'polygon',
		shapeOptions: {
			stroke: true,
			color: '#f06eaa',
			weight: 4,
			opacity: 0.5,
			fill: true,
			fillColor: null, //same as color by default
			fillOpacity: 0.2,
			clickable: true
		}
	},

	initialize: function (map, options) {
		L.Draw.Polyline.prototype.initialize.call(this, map, options);
		
		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Draw.Polygon.TYPE;
	},

	_updateMarkerHandler: function () {
		// The first marker shold have a click handler to close the polygon
		if (this._markers.length === 1) {
			this._markers[0].on('click', this._finishShape, this);
		}
	},

	_getTooltipText: function () {
		var text;
		if (this._markers.length === 0) {
			text = 'Click to start drawing shape.';
		} else if (this._markers.length < 3) {
			text = 'Click to continue drawing shape.';
		} else {
			text = 'Click first point to close this shape.';
		}
		return {
			text: text
		};
	},

	_shapeIsValid: function () {
		return this._markers.length >= 3;
	},

	_vertexAdded: function (latlng) {
		//calc area here
	},

	_cleanUpShape: function () {
		if (this._markers.length > 0) {
			this._markers[0].off('click', this._finishShape);
		}
	},

  _finishShape: function () {
    var intersects = this._poly.newLatLngIntersects(this._poly.getLatLngs()[0], true);

    if ((!this.options.allowIntersection && intersects) || !this._shapeIsValid()) {
      this._showErrorTooltip();
      return;
    }

    this._map.fire(
      'draw:polygon-created',
      { poly: new this.Poly(this._poly.getLatLngs(), this.options.shapeOptions) }
    );
    this.disable();
  }

});