/*
  moron design framework.js
  http://dev-kit.ru
*/

;(function(){
  "use strict";

  var ElementRipple = function ElementRipple(element){
    this._element = element;
    this.init();
  };

  window['ElementRipple'] = ElementRipple;

  ElementRipple.prototype.downHandler = function (event)
  {
    if (!this.rippleElement.style.width && !this.rippleElement.style.height) {
        var rect = this._element.getBoundingClientRect();
        this.boundHeight = rect.height;
        this.boundWidth = rect.width;
        this.rippleSize_ = Math.sqrt(rect.width * rect.width + rect.height * rect.height) + 4;
        this.rippleElement.style.width = this.rippleSize_ + 'px';
        this.rippleElement.style.height = this.rippleSize_ + 'px';
    }
    this.rippleElement.classList.add('is-visible');
    var frameCount = this.getFrameCount();
    if (frameCount > 0) {
        return;
    }
    this.setFrameCount(1);
    var bound = event.currentTarget.getBoundingClientRect();
    var x;
    var y;
    if (event.clientX === 0 && event.clientY === 0) {
        x = Math.round(bound.width / 2);
        y = Math.round(bound.height / 2);
    } else {
        var clientX = event.clientX !== undefined ? event.clientX : event.touches[0].clientX;
        var clientY = event.clientY !== undefined ? event.clientY : event.touches[0].clientY;
        x = Math.round(clientX - bound.left);
        y = Math.round(clientY - bound.top);
    }
    this.setRippleXY(x, y);
    this.setRippleStyles(true);
    window.requestAnimationFrame(this.animFrameHandler.bind(this));
  };

  ElementRipple.prototype.upHandler = function (event)
  {
    if (event && event.detail !== 2)
    {
      window.setTimeout(function () {
          this.rippleElement.classList.remove('is-visible');
      }.bind(this), 150);
    }
  };

  ElementRipple.prototype.init = function ()
  {
    var rippleContainer = document.createElement('span');
    rippleContainer.classList.add('yumii-ripple-container');
    this.rippleElement = document.createElement('span');
    this.rippleElement.classList.add('yumii-ripple-element');
    rippleContainer.appendChild(this.rippleElement);
    this.downHandler = this.downHandler.bind(this);
    this.upHandler = this.upHandler.bind(this);
    this._element.addEventListener('mousedown', this.downHandler);
    this._element.addEventListener('mouseup', this.upHandler);
    this._element.addEventListener('mouseleave', this.upHandler);
    this._element.addEventListener('touchend', this.upHandler);
    this._element.appendChild(rippleContainer);
    this.frameCount_ = 0;
    this.rippleSize_ = 0;
    this.x_ = 0;
    this.y_ = 0;
    this.getFrameCount = function () {
        return this.frameCount_;
    };

    this.setFrameCount = function (fC) {
        this.frameCount_ = fC;
    };
    this.setRippleXY = function (newX, newY) {
        this.x_ = newX;
        this.y_ = newY;
    };
    this.setRippleStyles = function (start) {
        if (this.rippleElement !== null) {
            var transformString;
            var scale;
            var size;
            var offset = 'translate(' + this.x_ + 'px, ' + this.y_ + 'px)';
            if (start) {
                scale = 'scale(0.0001, 0.0001)';
                size = '1px';
            } else {
                scale = '';
                size = this.rippleSize_ + 'px';
            }
            transformString = 'translate(-50%, -50%) ' + offset + scale;
            this.rippleElement.style.webkitTransform = transformString;
            this.rippleElement.style.msTransform = transformString;
            this.rippleElement.style.transform = transformString;
            if (start) {
                this.rippleElement.classList.remove('is-animating');
            } else {
                this.rippleElement.classList.add('is-animating');
            }
            this.animFrameHandler = function () {
                if (this.frameCount_-- > 0) {
                    window.requestAnimationFrame(this.animFrameHandler.bind(this));
                } else {
                    this.setRippleStyles(false);
                }
            };
        }
    };
  };

//Select Control
  var SelectControl = function SelectControl(element)
  {
    this._element = element;
    this.init();
  };

  window['SelectControl'] = SelectControl;

  SelectControl.prototype.init = function()
  {
    this._selectList = this._element.querySelector('ul');
    this._selectList.selected = (parseInt(this._element.getAttribute('selected')) > this._selectList.children.length) ? 'NaN' : parseInt(this._element.getAttribute('selected'));
    this._outerText = document.createElement('DIV');
    this._listContainer = document.createElement('DIV');
    this._button = document.createElement('BUTTON');
    this._iconButton = document.createElement('I');
    this._input = document.createElement('INPUT');
    this.setData = function(_object){
      this._outerText.innerHTML = _object.innerHTML;
      this._input.value = _object.getAttribute('value');
    }.bind(this);
    this.animFramHandler = function(){
      var offset = parseInt(this._outerText.getBoundingClientRect().bottom - (this._selectList.getBoundingClientRect().top));
      if(offset == -1)
        return;
      this.animation = window.requestAnimationFrame(this.animFramHandler.bind(this));
    };
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);

    this._listContainer.classList.add('yumii-select_container');
    this._iconButton.classList.add('fa', 'fa-arrow-right');
    this._outerText.classList.add('yumii-select_outertext');
    this._button.type = 'button';
    this._input.type = 'hidden';
    (this._element.getAttribute('data-name') == null) ?  false : this._input.name = this._element.getAttribute('data-name');
    if(!isNaN(this._selectList.selected))
      this.setData(this._selectList.children[this._selectList.selected]);
    this.slideUp();

    this._button.addEventListener('focus', this.onFocus);
    this._button.addEventListener('blur', this.onBlur);
    this._selectList.addEventListener('mousedown', this.onMouseDown);

    this._listContainer.appendChild(this._selectList);
    this._button.appendChild(this._iconButton);
    this._element.appendChild(this._input);
    this._element.appendChild(this._button);
    this._element.appendChild(this._outerText);
    this._element.appendChild(this._listContainer);
  };

  SelectControl.prototype.onFocus = function()
  {
    this.slideDown();
    window.requestAnimationFrame(this.animFramHandler.bind(this));
  };

  SelectControl.prototype.onBlur = function()
  {
    this.slideUp();
  };

  SelectControl.prototype.slideUp = function()
  {
    this._listContainer.style.zIndex = '-1';
    this._selectList.style.msTransform = 'translateY(-100%)';
    this._selectList.style.webkitTransform = 'translateY(-100%)';
    this._selectList.style.transform = 'translateY(-100%)';
  };

  SelectControl.prototype.slideDown = function()
  {
    this._listContainer.style.zIndex = '';
    if(this._listContainer.offsetHeight != parseInt(this._selectList.offsetHeight + 41))
      this._listContainer.style.height = parseInt(this._selectList.offsetHeight + 41);
    this._selectList.style.msTransform = '';
    this._selectList.style.webkitTransform = '';
    this._selectList.style.transform = '';
  }

  SelectControl.prototype.onMouseDown = function(event)
  {
    this.setData(event.target);
  };

//TAB Select
  var TabSelect = function TabSelect(element)
  {
    this._element = element;
    this.init();
  }

  window['TabSelect'] = TabSelect;

  TabSelect.prototype.clickHandler = function(event)
  {
    if(event.target.tagName == 'A')
    {
      this.nav_.querySelectorAll('a').forEach(function(i, a, arr){
        i.classList.remove('is-active');
      });
      this._element.querySelectorAll('.yumii-nav-tab').forEach(function(i, a, arr){
        i.style.display = 'none'
      });
      event.target.classList.add('is-active');
      document.querySelector(event.target.getAttribute('href')).style.display = 'block';
    }
  }

  TabSelect.prototype.init = function()
  {
    this.nav_ = this._element.querySelector('.yumii-navigation');
    this.clickHandler = this.clickHandler.bind(this);
    this.nav_.querySelectorAll('a').forEach(function(i, a, arr){
      if(i.classList.contains('is-active'))
      {
        document.querySelector(i.getAttribute('href')).style.display = 'block';
      }
    });
    this.nav_.addEventListener('click', this.clickHandler);
  }

  var ImageHoverBottom = function ImageHoverBottom(element)
  {
    this._element = element;
    this.init();
  };

  window['mageHoverBottom'] = ImageHoverBottom;

  ImageHoverBottom.prototype.init = function()
  {
    this.slow = this._element.querySelector('.yumii-slow');
    this.slow.style.background = 'rgba(0, 0, 0, .7)';
    this.img_ = this._element.querySelector('img');
    this.overHandler = this.overHandler.bind(this);
    this._element.addEventListener('mouseover', this.overHandler);
    this.leaveHandler = this.leaveHandler.bind(this);
    this._element.addEventListener('mouseleave', this.leaveHandler);
  }

  ImageHoverBottom.prototype.leaveHandler = function(event){
    this.slow.style.bottom = -this.slow.offsetHeight;
    this.img_.style.bottom = 0;
  }

  ImageHoverBottom.prototype.overHandler = function(event){
    this.img_.style.bottom = this.slow.offsetHeight;
    this.slow.style.bottom = 0;
  }

  var CheckBox = function CheckBox(element)
  {
    this._element = element;
    this.init();
  }

  window['CheckBox'] = CheckBox;

  CheckBox.prototype.init = function()
  {
    this.box_outline = document.createElement('span');
    this.box_outline.classList.add('yumii-checkbox__box_outline');
    this._inputCheck = this._element.querySelector('.yumii-checkbox__input');
    this.rippleContainer = document.createElement('span');
    this.rippleContainer.classList.add('yumii-checkbox_ripple_container');
    this._element.appendChild(this.rippleContainer);
    this._element.appendChild(this.box_outline);
    this.toggleHandler();
    this.toggleHandler = this.toggleHandler.bind(this);
    this.onChange = this.onChange.bind(this);
    this._element.addEventListener('change', this.onChange);
  }

  CheckBox.prototype.onChange = function(event)
  {
    this._element.classList.add('yumii-ripple');
    window.setTimeout(function () {
        this._element.classList.remove('yumii-ripple');
    }.bind(this), 230);
    this.toggleHandler();
  }

  CheckBox.prototype.toggleHandler = function(event)
  {
    if(this._inputCheck.checked)
      return this._element.classList.add('is-checked');
    this._element.classList.remove('is-checked');
  }

  var RadioButton = function RadioButton(element)
  {
    this._element = element;
    this.init();
  }

  window['RadioButton'] = RadioButton;

  RadioButton.prototype.init = function()
  {
    this.box_outline = document.createElement('span');
    this.box_outline.classList.add('yumii-radio__box_outline');
    this._inputCheck = this._element.querySelector('.yumii-radio__input');
    this.rippleContainer = document.createElement('span');
    this.rippleContainer.classList.add('yumii-radio_ripple_container');
    this._element.appendChild(this.rippleContainer);
    this._element.appendChild(this.box_outline);
    this.toggleHandler = this.toggleHandler.bind(this);
    this.onChange = this.onChange.bind(this);
    this._element.addEventListener('change', this.onChange);
    this.toggleHandler();
    this._element['RadioButton'] = this;
  }

  RadioButton.prototype.onChange = function(event)
  {
    this._element.classList.add('yumii-ripple');
    window.setTimeout(function () {
        this._element.classList.remove('yumii-ripple');
    }.bind(this), 230);
    var radios = document.getElementsByClassName('yumii-radio');
    for (var i = 0; i < radios.length; i++) {
        var button = radios[i].querySelector('.yumii-radio__input');
        // Different name == different group, so no point updating those.
        if (button.getAttribute('name') === this._inputCheck.getAttribute('name')) {
            if (typeof radios[i]['RadioButton'] !== 'undefined') {
                radios[i]['RadioButton'].toggleHandler();
            }
        }
    }
  }

  RadioButton.prototype.toggleHandler = function()
  {
    if(this._inputCheck.checked)
      return this._element.classList.add('is-checked');
    this._element.classList.remove('is-checked');
  }

  var BtnMenuShow = function BtnMenuShow(element){
    this._element = element;
    this.init();
  }

  window['BtnMenuShow'] = BtnMenuShow;

  BtnMenuShow.prototype.init = function()
  {
    this.btn_menu = document.createElement('BUTTON');
    this._menu_show = false;
    this.btn_menu.innerHTML = '<i class="fa fa-arrow-right"></i>';
    this.btn_menu.classList.add('yumii-nav-btn');
    this.onClick = this.onClick.bind(this);
    this.btn_menu.addEventListener('click', this.onClick);
    document.body.appendChild(this.btn_menu);
  }

  BtnMenuShow.prototype.onClick = function(event)
  {
    switch(this._menu_show = !this._menu_show)
    {
      case false :
        this.btn_menu.style.opacity = '';
        this.btn_menu.classList.remove('is-show');
        this._element.style.left = '-100%';
        break;
      case true :
        this.btn_menu.style.opacity = '1';
        this.btn_menu.classList.add('is-show');
        this._element.style.left = '0px';
        break;
    }
  }

  var TextField = function TextField(element){
    this._element = element;
    this.init();
  }

  window['TextField'] = TextField;

  TextField.prototype.init = function()
  {
    var border_bottom = document.createElement('span');
    this.anim_border = document.createElement('span');
    this.input_text = this._element.querySelector('.yumii-tf-input');
    border_bottom.style = "position : absolute; left : 0; bottom : 0; width : 100%; height : 2px; background : #ccc; z-index : 1";
    this.anim_border.style = "position: absolute; transform : translateX(-50); -moz-transform : translateX(-50%); -webkit-transform : translateX(-50%);  left : 50%; bottom : 0; width : 0; height : 2px; background : rgb(51, 153, 153); z-index : 2; transition : width cubic-bezier(1, 0.5, 0.8, 1) .20s";
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.input_text.addEventListener('focus', this.onFocus);
    this.input_text.addEventListener('blur', this.onBlur);
    this._element.appendChild(border_bottom);
    this._element.appendChild(this.anim_border);
    this.onBlur();
  }

  TextField.prototype.onFocus = function()
  {
      this.anim_border.style.width = '100%';
  }

  TextField.prototype.onBlur = function()
  {
    if(this.input_text.value == '')
      return this.anim_border.style.width = '0';
    this.onFocus();
  }

  var PopupShow = function PopupShow(header = '', text = '')
  {
    this._header = header;
    this._text = text;
    this.init();
    return this;
  }

  window['PopupShow'] = PopupShow;

  PopupShow.prototype.init = function()
  {
    this.popup = document.createElement('DIV');
    this.body_shadow = document.createElement('DIV');
    var popup_close = document.createElement('BUTTON');
    var popup_header = document.createElement('DIV');
    var popup_text = document.createElement('DIV');
    this.popup.classList.add('yumii-popup');
    popup_header.classList.add('yumii-popup__header');
    popup_text.classList.add('yumii-popup__body');
    popup_header.innerHTML = this._header;
    popup_text.innerHTML = this._text;
    popup_close.innerHTML = '<i style="font-size : 16px" class="fa fa-close"></i>';
    popup_close.classList.add('yumii-popup-close');
    this.onClose = this.onClose.bind(this);
    popup_close.addEventListener('click', this.onClose);
    this.popup.appendChild(popup_close);
    this.popup.appendChild(popup_header);
    this.popup.appendChild(popup_text);
    this.onShow = this.onShow.bind(this);
    document.body.appendChild(this.popup);
    document.body.appendChild(this.body_shadow);
  }

  PopupShow.prototype.onShow = function()
  {
    this.body_shadow.classList.add('yumii-body__shadow');
    this.popup.classList.add('yumii-popup_show');
  }

  PopupShow.prototype.onClose = function()
  {
    this.body_shadow.classList.remove('yumii-body__shadow');
    this.popup.classList.remove('yumii-popup_show');
  }

  var TextLabel = function TextLabel(element)
  {
    this._element = element;
    this.init();
  }

  window['TextLabel'] = TextLabel;

  TextLabel.prototype.init = function()
  {
    var border_bottom = document.createElement('span');
    this.anim_border = document.createElement('span');
    this._input_text = this._element.querySelector('.yumii-tp-input');
    this._label_text = this._element.querySelector('.yumii-tp-label');
    border_bottom.style = "position : absolute; left : 0; bottom : 0; width : 100%; height : 2px; background : #ccc; z-index : 1";
    this.anim_border.style = "position: absolute; transform : translateX(-50); -moz-transform : translateX(-50%); -webkit-transform : translateX(-50%);  left : 50%; bottom : 0; width : 0; height : 2px; background : rgb(51, 153, 153); z-index : 2; transition : width cubic-bezier(1, 0.5, 0.8, 1) .20s";
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this._input_text.addEventListener('focus', this.onFocus);
    this._input_text.addEventListener('blur', this.onBlur);
    this._element.appendChild(border_bottom);
    this._element.appendChild(this.anim_border);
    this.onBlur();
  }

  TextLabel.prototype.onFocus = function(event)
  {
    this._element.classList.add('yumii-tp-focus');
    this.anim_border.style.width = '100%';
  }

  TextLabel.prototype.onBlur = function(event)
  {
    if(this._input_text.value == '')
    {
      this._element.classList.remove('yumii-tp-focus');
      return this.anim_border.style.width = '0';
    }
    this.onFocus();
  }

  var ProgressBar = function ProgressBar(element)
  {
    this._element = element;
    this.init();
  }

  window['ProgressBar'] = ProgressBar;

  ProgressBar.prototype.init = function()
  {
    this._bar = document.createElement('DIV');
    this._bar.classList.add('bar');
	this._min = parseInt(this._element.getAttribute('min'));
    this._max = parseInt(this._element.getAttribute('max'));
    this._element.appendChild(this._bar);
    var ev = document.createEvent('Events');
    this.setProgress = this.setProgress.bind(this);
    ev['set_progress'] = this.setProgress;
    ev.initEvent('setProgress' , true, true);
    this._element.dispatchEvent(ev);
  }


  ProgressBar.prototype.setProgress = function(_num)
  {
    this._bar.style.width = ((_num - this._min) / (this._max - this._min)) * 100 + '%';
  }

  var ElementSlider = function ElementSlider(element)
  {
    this._element = element;
    this.init();
  }

  window['ElementSlider'] = ElementSlider;

  ElementSlider.prototype.init = function()
  {
    if(this._element)
    {
      var Container = document.createElement('DIV');
      this._element.parentElement.insertBefore(Container, this._element);
      this._element.parentElement.removeChild(this._element);
      Container.appendChild(this._element);
      Container.classList.add('yumii-slider__container');
      var backgroundFlex = document.createElement('DIV');
      backgroundFlex.classList.add('yumii-slider__flex');
      Container.appendChild(backgroundFlex);
      this.backgroundLower = document.createElement('DIV');
      this.backgroundLower.classList.add('yumii-slider__lower');
      backgroundFlex.appendChild(this.backgroundLower);
      this.backgroundUpper = document.createElement('DIV');
      this.backgroundUpper.classList.add('yumii-slider__upper');
      backgroundFlex.appendChild(this.backgroundUpper);
      this.onChange = this.onChange.bind(this);
      this.onInput = this.onInput.bind(this);
      this.UpdateValueStyle = this.UpdateValueStyle.bind(this);
      this._element.addEventListener('change', this.onChange);
      this._element.addEventListener('input', this.onInput);
      this.UpdateValueStyle();
    }
  }

  ElementSlider.prototype.onChange = function()
  {
    this.UpdateValueStyle();
  }

  ElementSlider.prototype.onInput = function()
  {
    this.UpdateValueStyle();
  }

  ElementSlider.prototype.UpdateValueStyle = function()
  {
    var fraction = (this._element.value - this._element.min) / (this._element.max - this._element.min);
    (fraction > 0) ? this._element.classList.add('is-active') : this._element.classList.remove('is-active');
    this.backgroundLower.style.flex = fraction;
    this.backgroundLower.style.webkitFlex = fraction;
    this.backgroundUpper.style.flex = 1 - fraction;
    this.backgroundUpper.style.webkitFlex = 1 - fraction;
  }

  window.addEventListener('load', function(){
    document.querySelectorAll('.yumii-js-ripple').forEach(function(_object){
      new ElementRipple(_object);
    });
    document.querySelectorAll('.yumii-select-control').forEach(function(_object){
      new SelectControl(_object);
    });
    document.querySelectorAll('.yumii-tabs').forEach(function(_object){
      new TabSelect(_object);
    });
    document.querySelectorAll('.yumii-imagehover-bottom').forEach(function(_object){
      new ImageHoverBottom(_object);
    });
    document.querySelectorAll('.yumii-checkbox').forEach(function(_object){
      new CheckBox(_object);
    });
    document.querySelectorAll('.yumii-radio').forEach(function(_object){
      new RadioButton(_object);
    });
    document.querySelectorAll('.yumii_layout_fixed_left').forEach(function(_object){
      new BtnMenuShow(_object);
    });
    document.querySelectorAll('.yumii-text-field').forEach(function(_object){
      new TextField(_object);
    });
    document.querySelectorAll('.yumii-text-placeholder').forEach(function(_object){
      new TextLabel(_object);
    });
    document.querySelectorAll('.yumii-progress').forEach(function(_object){
      new ProgressBar(_object);
    });
    document.querySelectorAll('.yumii-slider').forEach(function(_object){
      new ElementSlider(_object);
    });
  });

} ());
