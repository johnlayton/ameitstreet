L.SimpleShape = {};

L.Draw.SimpleShape = L.Draw.Feature.extend({
	addHooks: function () {
		L.Draw.Feature.prototype.addHooks.call(this);
		if (this._map) {
			this._map.dragging.disable();
			//TODO refactor: move cursor to styles
			this._container.style.cursor = 'crosshair';

			this._tooltip.updateContent({ text: this._initialLabelText });

			this._map
				.on('mousedown', this._onMouseDown, this)
				.on('mousemove', this._onMouseMove, this);

      if (L.Browser.touch) {
        L.DomEvent
          .addListener(this._container, 'touchstart', this._onMouseDown, this)
          .addListener(document, 'touchmove', this._onMouseMove, this);
      }

		}
	},

	removeHooks: function () {
		L.Draw.Feature.prototype.removeHooks.call(this);
		if (this._map) {
			this._map.dragging.enable();
			//TODO refactor: move cursor to styles
			this._container.style.cursor = '';

			this._map
				.off('mousedown', this._onMouseDown, this)
				.off('mousemove', this._onMouseMove, this);

			L.DomEvent.off(document, 'mouseup', this._onMouseUp);

      if (L.Browser.touch) {
        L.DomEvent
          .removeListener(this._container, 'touchstart', this._onMouseDown)
          .removeListener(document, 'touchmove', this._onMouseMove)
          .removeListener(document, 'touchend', this._onMouseUp);
      }

			// If the box element doesn't exist they must not have moved the mouse, so don't need to destroy/return
			if (this._shape) {
				this._map.removeLayer(this._shape);
				delete this._shape;
			}
		}
		this._isDrawing = false;
	},

  _onMouseDown: function (e) {
    this._isDrawing = true;

    this._tooltip.updateContent({ text: 'Release mouse to finish drawing.' });

    this._startLatLng = this._map.mouseEventToLatLng(e.touches ? e.touches[0] : e);

    if (e.touches) {
      L.DomEvent.stopPropagation(e);
    }

    L.DomEvent
      .addListener(document, 'mouseup', this._onMouseUp, this)
      .preventDefault(e);

    if (L.Browser.touch) {
      L.DomEvent
        .addListener(document, 'touchend', this._onMouseUp, this);
    }
  },

	_onMouseMove: function (e) {
		var latlng = e.latlng;

    if (!latlng) {
      latlng = this._map.mouseEventToLatLng(e.touches ? e.touches[0] : e);
    }

    if (e.touches) {
      L.DomEvent.stopPropagation(e);
    }

		this._tooltip.updatePosition(latlng);
		if (this._isDrawing) {
			this._tooltip.updateContent({ text: 'Release mouse to finish drawing.' });
			this._drawShape(latlng);
		}
	},

	_onMouseUp: function (e) {
    this._endLatLng = this._map.mouseEventToLatLng(e.changedTouches ? e.changedTouches[0] : e);
    if (e.touches) {
      L.DomEvent.stopPropagation(e);
    }

    if (this._shape) {
			this._fireCreatedEvent();
		}
		
		this.disable();
	}
});