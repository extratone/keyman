namespace com.keyman.osk {
  export class KeyData {
    ['key']: OSKKey;
    ['keyId']: string;
    ['subKeys']?: OSKKeySpec[];

    constructor(keyData: OSKKey, keyId: string) {
      this['key'] = keyData;
      this['keyId'] = keyId;
    }
  }

  export type KeyElement = HTMLDivElement & KeyData;

  // Many thanks to https://www.typescriptlang.org/docs/handbook/advanced-types.html for this.
  export function link(elem: HTMLDivElement, data: KeyData): KeyElement {
    let e = <KeyElement> elem;

    // Merges all properties and methods of KeyData onto the underlying HTMLDivElement, creating a merged class.
    for(let id in data) {
      if(!e.hasOwnProperty(id)) {
        (<any>e)[id] = (<any>data)[id];
      }
    }

    return e;
  }

  export function isKey(elem: Node): boolean {
    return elem && ('key' in elem) && ((<any> elem['key']) instanceof OSKKey);
  }

  export function getKeyFrom(elem: Node): KeyElement {
    if(isKey(elem)) {
      return <KeyElement> elem;
    } else {
      return null;
    }
  }

  export class OSKKeySpec implements keyboards.LayoutKey {
    id: string;

    // Only set (within @keymanapp/keyboard-processor) for keys actually specified in a loaded layout
    baseKeyID?: string;
    coreID?: string;
    elementID?: string;

    text?: string;
    sp?: number | keyboards.ButtonClass;
    width: string;
    layer?: string; // The key will derive its base modifiers from this property - may not equal the layer on which it is displayed.
    nextlayer?: string;
    pad?: string;
    widthpc?: number; // Added during OSK construction.
    padpc?: number; // Added during OSK construction.
    sk?: OSKKeySpec[];

    constructor(id: string, text?: string, width?: string, sp?: number | keyboards.ButtonClass, nextlayer?: string, pad?: string) {
      this.id = id;
      this.text = text;
      this.width = width ? width : "50";
      this.sp = sp;
      this.nextlayer = nextlayer;
      this.pad = pad;
    }
  }

  export abstract class OSKKey {
    // Defines the PUA code mapping for the various 'special' modifier/control keys on keyboards.
    // `specialCharacters` must be kept in sync with the same variable in builder.js. See also CompileKeymanWeb.pas: CSpecialText10
    static readonly specialCharacters = {
      '*Shift*':    8,
      '*Enter*':    5,
      '*Tab*':      6,
      '*BkSp*':     4,
      '*Menu*':     11,
      '*Hide*':     10,
      '*Alt*':      25,
      '*Ctrl*':     1,
      '*Caps*':     3,
      '*ABC*':      16,
      '*abc*':      17,
      '*123*':      19,
      '*Symbol*':   21,
      '*Currency*': 20,
      '*Shifted*':  8, // set SHIFTED->9 for filled arrow icon
      '*AltGr*':    2,
      '*TabLeft*':  7,
      '*LAlt*':     0x56,
      '*RAlt*':     0x57,
      '*LCtrl*':    0x58,
      '*RCtrl*':    0x59,
      '*LAltCtrl*':       0x60,
      '*RAltCtrl*':       0x61,
      '*LAltCtrlShift*':  0x62,
      '*RAltCtrlShift*':  0x63,
      '*AltShift*':       0x64,
      '*CtrlShift*':      0x65,
      '*AltCtrlShift*':   0x66,
      '*LAltShift*':      0x67,
      '*RAltShift*':      0x68,
      '*LCtrlShift*':     0x69,
      '*RCtrlShift*':     0x70,
      // Added in Keyman 14.0.
      '*LTREnter*':       0x05, // Default alias of '*Enter*'.
      '*LTRBkSp*':        0x04, // Default alias of '*BkSp*'.
      '*RTLEnter*':       0x71,
      '*RTLBkSp*':        0x72,
      '*ShiftLock*':      0x73,
      '*ShiftedLock*':    0x74,
      '*ZWNJ*':           0x75, // If this one is specified, auto-detection will kick in.
      '*ZWNJiOS*':        0x75, // The iOS version will be used by default, but the
      '*ZWNJAndroid*':    0x76, // Android platform has its own default glyph.
    };

    static readonly BUTTON_CLASSES = [
      'default',
      'shift',
      'shift-on',
      'special',
      'special-on',
      '', // Key classes 5 through 7 are reserved for future use.
      '',
      '',
      'deadkey',
      'blank',
      'hidden'
    ];

    static readonly HIGHLIGHT_CLASS = 'kmw-key-touched';

    spec: OSKKeySpec;
    btn: KeyElement;
    label: HTMLSpanElement;

    /**
     * The layer of the OSK on which the key is displayed.
     */
    readonly layer: string;

    constructor(spec: OSKKeySpec, layer: string) {
      this.spec = spec;
      this.layer = layer;
    }

    abstract getId(): string;

    /**
     * Attach appropriate class to each key button, according to the layout
     *
     * @param       {Object=}   layout  source layout description (optional, sometimes)
     */
    public setButtonClass(vkbd: VisualKeyboard) {
      let key = this.spec;
      let btn = this.btn;

      var n=0;
      if(typeof key['dk'] == 'string' && key['dk'] == '1') {
        n=8;
      }

      if(typeof key['sp'] == 'string') {
        n=parseInt(key['sp'],10);
      }

      if(n < 0 || n > 10) {
        n=0;
      }

      // Apply an overriding class for 5-row layouts
      var nRows=vkbd.layout['layer'][0]['row'].length;
      if(nRows > 4 && vkbd.device.formFactor == 'phone') {
        btn.className='kmw-key kmw-5rows kmw-key-'+OSKKey.BUTTON_CLASSES[n];
      } else {
        btn.className='kmw-key kmw-key-'+OSKKey.BUTTON_CLASSES[n];
      }
    }

    // "Frame key" - generally refers to non-linguistic keys on the keyboard
    public isFrameKey(): boolean {
      let classIndex = this.spec['sp'] || 0;
      switch(OSKKey.BUTTON_CLASSES[classIndex]) {
        case 'default':
        case 'deadkey':
          // Note:  will (generally) include the spacebar.
          return false;
        default:
          return true;
      }
    }

    public allowsKeyTip(): boolean {
      if(this.isFrameKey()) {
        return false;
      } else {
        return !this.btn.classList.contains('kmw-spacebar');
      }
    }

    public highlight(on: boolean) {
      var classes=this.btn.classList;

      if(on) {
        if(!classes.contains(OSKKey.HIGHLIGHT_CLASS)) {
          classes.add(OSKKey.HIGHLIGHT_CLASS);
        }
      } else {
        classes.remove(OSKKey.HIGHLIGHT_CLASS);
      }
    }

    /**
     * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
     *
     * @param {String} text The text to be rendered.
     * @param {String} style The CSSStyleDeclaration for an element to measure against, without modification.
     *
     * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
     * This version has been substantially modified to work for this particular application.
     */
    static getTextMetrics(text: string, emScale: number, style: {fontFamily?: string, fontSize: string}): TextMetrics {
      // A final fallback - having the right font selected makes a world of difference.
      if(!style.fontFamily) {
        style.fontFamily = getComputedStyle(document.body).fontFamily;
      }

      if(!style.fontSize || style.fontSize == "") {
        style.fontSize = '1em';
      }

      let fontFamily = style.fontFamily;
      let fontSpec = getFontSizeStyle(style.fontSize);

      var fontSize: string;
      if(fontSpec.absolute) {
        // We've already got an exact size - use it!
        fontSize = fontSpec.val + 'px';
      } else {
        fontSize = fontSpec.val * emScale + 'px';
      }

      // re-use canvas object for better performance
      var canvas: HTMLCanvasElement = OSKKey.getTextMetrics['canvas'] || 
                                     (OSKKey.getTextMetrics['canvas'] = document.createElement("canvas"));
      var context = canvas.getContext("2d");
      context.font = fontSize + " " + fontFamily;
      var metrics = context.measureText(text);

      return metrics;
    }

    getIdealFontSize(osk: VisualKeyboard, style: {height?: string, fontFamily?: string, fontSize: string}): string {
      // Recompute the new width for use in autoscaling calculations below, just in case.
      let emScale = osk.getKeyEmFontSize();
      let metrics = OSKKey.getTextMetrics(this.spec.text, emScale, style);

      let fontSpec = getFontSizeStyle(style.fontSize);
      let keyWidth = this.getKeyWidth(osk);
      const MAX_X_PROPORTION = 0.90;
      const MAX_Y_PROPORTION = 0.90;
      const X_PADDING = 2;
      const Y_PADDING = 2;

      var fontHeight: number, keyHeight: number;
      if(metrics.fontBoundingBoxAscent) {
        fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
      }

      let textHeight = fontHeight ? fontHeight + Y_PADDING : 0;
      if(style.height && style.height.indexOf('px') != -1) {
        keyHeight = Number.parseFloat(style.height.substring(0, style.height.indexOf('px')));
      }

      let xProportion = (keyWidth * MAX_X_PROPORTION) / (metrics.width + X_PADDING); // How much of the key does the text want to take?
      let yProportion = textHeight && keyHeight ? (keyHeight * MAX_Y_PROPORTION) / textHeight : undefined;

      var proportion: number = xProportion;
      if(yProportion && yProportion < xProportion) {
        proportion = yProportion;
      }

      // Never upscale keys past the default - only downscale them.
      // Proportion < 1:  ratio of key width to (padded [loosely speaking]) text width
      //                  maxProportion determines the 'padding' involved.
      if(proportion < 1) {
        if(fontSpec.absolute) {
          return proportion * fontSpec.val + 'px';
        } else {
          return proportion * fontSpec.val + 'em';
        }
      }
    }

    getKeyWidth(vkbd: VisualKeyboard): number {
      let units = this.objectUnits(vkbd);

      if(units == 'px') {
        // For mobile devices, we presently specify width directly in pixels.  Just use that!
        return this.spec['widthpc'];
      } else if(units == '%') {
        // For desktop devices, each key is given a %age of the total OSK width.  We'll need to compute an
        // approximation for that.  `this.kbdDiv` is the element controlling the OSK's width, set in px.

        // This is an approximation that tends to be a bit too large, but it's close enough to be useful.
        return Math.floor(vkbd.width * this.spec['widthpc'] / 100);
      }
    }

    objectUnits(vkbd: VisualKeyboard): string {
      // Returns a unit string corresponding to how the width for each key is specified.
      if(vkbd.device.formFactor == 'desktop' || vkbd.isStatic) {
        return '%';
      } else {
        return 'px';
      }
    }

    /**
     * Replace default key names by special font codes for modifier keys
     *
     *  @param  {string}  oldText
     *  @return {string}
     **/
    protected renameSpecialKey(oldText: string, osk: VisualKeyboard): string {
      // If a 'special key' mapping exists for the text, replace it with its corresponding special OSK character.
      switch(oldText) {
        case '*ZWNJ*':
          // Default ZWNJ symbol comes from iOS.  We'd rather match the system defaults where
          // possible / available though, and there's a different standard symbol on Android.
          oldText = osk.device.coreSpec.OS == com.keyman.utils.OperatingSystem.Android ?
            '*ZWNJAndroid*' :
            '*ZWNJiOS*';
          break;
        case '*Enter*':
          oldText = osk.isRTL ? '*RTLEnter*' : '*LTREnter*';
          break;
        case '*BkSp*':
          oldText = osk.isRTL ? '*RTLBkSp*' : '*LTRBkSp*';
          break;
        default:
          // do nothing.
      }

      let specialCodePUA = 0XE000 + VisualKeyboard.specialCharacters[oldText];

      return VisualKeyboard.specialCharacters[oldText] ?
        String.fromCharCode(specialCodePUA) :
        oldText;
    }

    // Produces a HTMLSpanElement with the key's actual text.
    protected generateKeyText(osk: VisualKeyboard): HTMLSpanElement {
      let spec = this.spec;

      // Add OSK key labels
      var keyText;
      var t = document.createElement('span'), ts=t.style;
      if(spec['text'] == null || spec['text'] == '') {
        keyText='\xa0';  // default:  nbsp.
        if(typeof spec['id'] == 'string') {
          // If the ID's Unicode-based, just use that code.
          if(/^U_[0-9A-F]{4}$/i.test(spec['id'])) {
            keyText=String.fromCharCode(parseInt(spec['id'].substr(2),16));
          }
        }
      } else {
        keyText=spec['text'];

        // Unique layer-based transformation:  SHIFT-TAB uses a different glyph.
        if(keyText == '*Tab*' && this.layer == 'shift') {
          keyText = '*TabLeft*';
        }
      }

      t.className='kmw-key-text';

      let specialText = this.renameSpecialKey(keyText, osk);
      if(specialText != keyText) {
        // The keyboard wants to use the code for a special glyph defined by the SpecialOSK font.
        keyText = specialText;
        spec['font'] = "SpecialOSK";
      }

      // Grab our default for the key's font and font size.
      ts.fontSize=osk.fontSize;     //Build 344, KMEW-90

      //Override font spec if set for this key in the layout
      if(typeof spec['font'] == 'string' && spec['font'] != '') {
        ts.fontFamily=spec['font'];
      }

      if(typeof spec['fontsize'] == 'string' && spec['fontsize'] != '') {
        ts.fontSize=spec['fontsize'];
      }

      // For some reason, fonts will sometimes 'bug out' for the embedded iOS page if we
      // instead assign fontFamily to the existing style 'ts'.  (Occurs in iOS 12.)
      let styleSpec: {fontFamily?: string, fontSize: string} = {fontSize: ts.fontSize};

      if(ts.fontFamily) {
        styleSpec.fontFamily = ts.fontFamily;
      } else {
        styleSpec.fontFamily = osk.fontFamily; // Helps with style sheet calculations.
      }

      // Check the key's display width - does the key visualize well?
      let emScale = osk.getKeyEmFontSize();
      var width: number = OSKKey.getTextMetrics(keyText, emScale, styleSpec).width;
      if(width == 0 && keyText != '' && keyText != '\xa0') {
        // Add the Unicode 'empty circle' as a base support for needy diacritics.

        // Disabled by mcdurdin 2020-10-19; dotted circle display is inconsistent on iOS/Safari
        // at least and doesn't combine with diacritic marks. For consistent display, it may be
        // necessary to build a custom font that does not depend on renderer choices for base
        // mark display -- e.g. create marks with custom base included, potentially even on PUA
        // code points and use those in rendering the OSK. See #3039 for more details.
        // keyText = '\u25cc' + keyText;

        if(osk.isRTL) {
          // Add the RTL marker to ensure it displays properly.
          keyText = '\u200f' + keyText;
        }
      }

      ts.fontSize = this.getIdealFontSize(osk, styleSpec);

      // Finalize the key's text.
      t.innerHTML = keyText;

      return t;
    }

    public isUnderTouch(touch: Touch): boolean {
      let x = touch.clientX;
      let y = touch.clientY;

      let btn = this.btn;
      let x0 = dom.Utils.getAbsoluteX(btn); 
      let y0 = dom.Utils.getAbsoluteY(btn);//-document.body.scrollTop;
      
      let x1 = x0 + btn.offsetWidth;
      let y1 = y0 + btn.offsetHeight;

      return (x > x0 && x < x1 && y > y0 && y < y1);
    }
  }
}
