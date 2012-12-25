L.Draw.Marker = L.Draw.Feature.extend({
	statics: {
		TYPE: 'marker'
	},

	options: {
    name: 'marker',
		icon: new L.Icon.Default(),
		zIndexOffset: 2000 // This should be > than the highest z-index any markers
	},

	initialize: function (map, options) {
		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Draw.Marker.TYPE;

		L.Draw.Feature.prototype.initialize.call(this, map, options);
	},
	
	addHooks: function () {
		L.Draw.Feature.prototype.addHooks.call(this);
		
		if (this._map) {
			this._tooltip.updateContent({ text: 'Click map to place marker.' });
			this._map.on('mousemove', this._onMouseMove, this);
      if (L.Browser.touch) {
        L.DomEvent.addListener(this._container, 'touchstart', this._onMouseMove, this);
        L.DomEvent.addListener(this._container, 'touchmove', this._onMouseMove, this);
      }
		}
	},

	removeHooks: function () {
		L.Draw.Feature.prototype.removeHooks.call(this);
		
		if (this._map) {
			if (this._marker) {
				this._marker.off('click', this._onClick);
				this._map
					.off('click', this._onClick)
					.removeLayer(this._marker);
				delete this._marker;
			}

			this._map.off('mousemove', this._onMouseMove);
      if (L.Browser.touch) {
        L.DomEvent
          .removeListener(this._container, 'touchmove', this._onMouseMove)
          .removeListener(this._container, 'touchend', this._onClick);
      }
		}
  },

	_onMouseMove: function (e) {
		var latlng = e.latlng;

    if ( !latlng ) {
      latlng = this._map.mouseEventToLatLng( e.changedTouches[0] )
    }

		this._tooltip.updatePosition(latlng);

		if (!this._marker) {
			this._marker = new L.Marker(latlng, {
				icon: this.options.icon,
				zIndexOffset: this.options.zIndexOffset
			});
			// Bind to both marker and map to make sure we get the click event.
			this._marker.on('click', this._onClick, this);
			this._map
				.on('click', this._onClick, this)
				.addLayer(this._marker);
      if (L.Browser.touch) {
        L.DomEvent
          .addListener(this._container, 'touchend', this._onClick, this);
      }
		}
		else {
			this._marker.setLatLng(latlng);
		}
	},

	_onClick: function (e) {

/*
    var latlng = e.latlng;

    if ( !latlng ) {
      latlng = this._map.mouseEventToLatLng( e.changedTouches[0] )
    }
*/

		this._map.fire(
			'draw:marker-created',
			{ marker: new L.Marker(this._marker.getLatLng(), { icon: this.options.icon }) }
		);
		this.disable();
	}
});