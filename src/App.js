import React, { useState, useEffect, useRef } from 'react';
import { ChromePicker } from 'react-color';
import DOMPurify from 'dompurify';
import './App.css';

const App = () => {
  const [text, setText] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [preview, setPreview] = useState(null);
  const [fileFormat, setFileFormat] = useState('png');
  const [imageSize, setImageSize] = useState(128);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [isAutoBgColor, setIsAutoBgColor] = useState(true);
  const [selectedFont, setSelectedFont] = useState('Arial');
  const textColorPickerRef = useRef(null);
  const bgColorPickerRef = useRef(null);

  useEffect(() => {
    handlePreview();
  }, [
    text,
    textColor,
    backgroundColor,
    isAutoBgColor,
    selectedFont,
    imageSize,
  ]);

  const handleTextChange = (event) => {
    const inputValue = event.target.value.slice(0, 2);
    const sanitizedText = DOMPurify.sanitize(inputValue, { ALLOWED_TAGS: [] });
    setText(sanitizedText);
  };

  const handleTextColorChange = (newColor) => {
    setTextColor(newColor.hex);
  };

  const handleBgColorChange = (newColor) => {
    setBackgroundColor(newColor.hex);
  };

  const handleFileFormatChange = (event) => {
    setFileFormat(event.target.value);
  };

  const handleFontStyleChange = (event) => {
    setSelectedFont(event.target.value);
  };

  const handleImageSizeChange = (event) => {
    const newSize = parseInt(event.target.value);
    setImageSize(newSize);
  };

  const handlePreview = () => {
    const canvas = document.createElement('canvas');
    canvas.width = imageSize;
    canvas.height = imageSize;
    const ctx = canvas.getContext('2d');
    const textSize = imageSize / 2;
    ctx.font = `bold ${textSize}px ${selectedFont}`;

    if (isAutoBgColor) {
      const hslColor = hexToHSL(textColor);
      const adjustedColor = `hsl(${hslColor.h}, ${hslColor.s * 0.5}%, ${
        hslColor.l > 50 ? hslColor.l - 20 : hslColor.l + 20
      }%)`;
      ctx.fillStyle = adjustedColor;
    } else {
      ctx.fillStyle = backgroundColor;
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = textColor;
    ctx.font = `bold ${textSize}px ${selectedFont}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    setPreview(canvas.toDataURL(`image/${fileFormat}`));
  };

  const handleSaveImage = () => {
    if (fileFormat === 'svg') {
      const sanitizedText = DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
      const fileName = `icon-${encodeURIComponent(sanitizedText)}.svg`;
      const svgContent = generateSVGContent();
      const sanitizedSvgContent = DOMPurify.sanitize(svgContent);
      const blob = new Blob([sanitizedSvgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `icon-${text}.svg`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);

      link.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window,
        })
      );

      URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } else {
      const sanitizedText = DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
      const fileName = `icon-${encodeURIComponent(
        sanitizedText
      )}.${fileFormat}`;
      const link = document.createElement('a');
      link.href = preview;
      link.download = `icon-${text}.${fileFormat}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';

      link.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window,
        })
      );
    }
  };

  const generateSVGContent = () => {
    let imageContent;

    if (fileFormat === 'webp') {
      const canvas = document.createElement('canvas');
      canvas.width = imageSize;
      canvas.height = imageSize;
      const ctx = canvas.getContext('2d');

      if (isAutoBgColor) {
        const hslColor = hexToHSL(textColor);
        const adjustedColor = `hsl(${hslColor.h}, ${hslColor.s * 0.5}%, ${
          hslColor.l > 50 ? hslColor.l - 20 : hslColor.l + 20
        }%)`;
        ctx.fillStyle = adjustedColor;
      } else {
        ctx.fillStyle = backgroundColor;
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = textColor;
      ctx.font = `bold 100px ${selectedFont}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      imageContent = canvas.toDataURL('image/webp');
    } else {
      const sanitizedText = DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
      imageContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${imageSize}" height="${imageSize}">
          <rect width="100%" height="100%" fill="${
            isAutoBgColor ? textColor : backgroundColor
          }" />
          <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="${textColor}" font-size="100px" font-weight="bold">
            ${sanitizedText}
          </text>
        </svg>
      `;
    }

    return imageContent;
  };

  const handleTextColorPickerToggle = () => {
    setShowTextColorPicker(!showTextColorPicker);
  };

  const handleBgColorPickerToggle = () => {
    setShowBgColorPicker(!showBgColorPicker);
  };

  const handleClickOutsideColorPicker = (event) => {
    if (
      (textColorPickerRef.current &&
        !textColorPickerRef.current.contains(event.target)) ||
      (bgColorPickerRef.current &&
        !bgColorPickerRef.current.contains(event.target))
    ) {
      setShowTextColorPicker(false);
      setShowBgColorPicker(false);
    }
  };

  const handleBgColorToggle = () => {
    setIsAutoBgColor(!isAutoBgColor);
  };

  const hexToHSL = (hexColor) => {
    const rgbColor = hexToRGB(hexColor);
    const r = rgbColor.r / 255;
    const g = rgbColor.g / 255;
    const b = rgbColor.b / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l;

    l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
        default:
          break;
      }
      h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  const hexToRGB = (hexColor) => {
    const hex = hexColor.replace('#', '');
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
  };

  useEffect(() => {
    const handleClickOutsideColorPicker = (event) => {
      if (
        (textColorPickerRef.current &&
          !textColorPickerRef.current.contains(event.target)) ||
        (bgColorPickerRef.current &&
          !bgColorPickerRef.current.contains(event.target))
      ) {
        setShowTextColorPicker(false);
        setShowBgColorPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideColorPicker);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideColorPicker);
    };
  }, []);

  return (
    <div className="container">
      <h1 className="main-title">Font Icon Creator</h1>
      <div className="form-group">
        <label>Text:</label>
        <input
          type="text"
          maxLength="2"
          value={text}
          onChange={handleTextChange}
        />
      </div>
      <div className="form-group">
        <label>Text Color:</label>
        <div className="color-picker-wrapper">
          <div
            className="color-preview"
            onClick={handleTextColorPickerToggle}
            style={{ backgroundColor: textColor }}
          ></div>
          {showTextColorPicker && (
            <div ref={textColorPickerRef} className="color-picker-container">
              <ChromePicker
                color={textColor}
                onChange={handleTextColorChange}
              />
            </div>
          )}
        </div>
      </div>
      <div className="form-group">
        <label>Background Color:</label>
        <div className="bg-color-toggle">
          <button
            className={`toggle-button ${!isAutoBgColor ? 'active' : ''}`}
            onClick={handleBgColorToggle}
          >
            {isAutoBgColor ? 'Auto' : 'Manual'}
          </button>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="1em"
            viewBox="0 0 512 512"
          >
            <path d="M0 224c0 17.7 14.3 32 32 32s32-14.3 32-32c0-53 43-96 96-96H320v32c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l64-64c12.5-12.5 12.5-32.8 0-45.3l-64-64c-9.2-9.2-22.9-11.9-34.9-6.9S320 19.1 320 32V64H160C71.6 64 0 135.6 0 224zm512 64c0-17.7-14.3-32-32-32s-32 14.3-32 32c0 53-43 96-96 96H192V352c0-12.9-7.8-24.6-19.8-29.6s-25.7-2.2-34.9 6.9l-64 64c-12.5 12.5-12.5 32.8 0 45.3l64 64c9.2 9.2 22.9 11.9 34.9 6.9s19.8-16.6 19.8-29.6V448H352c88.4 0 160-71.6 160-160z" />
          </svg>
        </div>
        {isAutoBgColor ? (
          <div className="auto-bg-color-info">
            Automatically set based on text color.
          </div>
        ) : (
          <div className="color-picker-wrapper">
            <div
              className="color-preview"
              onClick={handleBgColorPickerToggle}
              style={{ backgroundColor: backgroundColor }}
            ></div>
            {showBgColorPicker && (
              <div ref={bgColorPickerRef} className="color-picker-container">
                <ChromePicker
                  color={backgroundColor}
                  onChange={handleBgColorChange}
                />
              </div>
            )}
          </div>
        )}
      </div>
      <div className="form-group">
        <label>Font Style:</label>
        <select value={selectedFont} onChange={handleFontStyleChange}>
          <optgroup label="明朝体">
            <option value="serif">Default</option>
            <option value="Alegreya">Alegreya</option>
            <option value="Almendra">Almendra</option>
            <option value="Amiri">Amiri</option>
            <option value="Arvo">Arvo</option>
            <option value="Cormorant">Cormorant</option>
            <option value="Crimson Text">Crimson Text</option>
            <option value="Droid Serif">Droid Serif</option>
            <option value="EB Garamond">EB Garamond</option>
            <option value="Fanwood Text">Fanwood Text</option>
            <option value="Gentium Basic">Gentium Basic</option>
            <option value="Judson">Judson</option>
            <option value="Lora">Lora</option>
            <option value="Merriweather">Merriweather</option>
            <option value="Neuton">Neuton</option>
            <option value="Old Standard TT">Old Standard TT</option>
            <option value="Playfair Display">Playfair Display</option>
            <option value="PT Serif">PT Serif</option>
            <option value="Quattrocento">Quattrocento</option>
            <option value="Roboto Slab">Roboto Slab</option>
            <option value="Spectral">Spectral</option>
            <option value="Tinos">Tinos</option>
            <option value="Vollkorn">Vollkorn</option>
            <option value="Yeseva One">Yeseva One</option>
            {/* Add more serif fonts here */}
          </optgroup>
          <optgroup label="ゴシック体">
            <option value="sans-serif">Default</option>
            <option value="Abel">Abel</option>
            <option value="Arimo">Arimo</option>
            <option value="Barlow">Barlow</option>
            <option value="Cabin">Cabin</option>
            <option value="Droid Sans">Droid Sans</option>
            <option value="Exo">Exo</option>
            <option value="Fira Sans">Fira Sans</option>
            <option value="Gothic A1">Gothic A1</option>
            <option value="Hind">Hind</option>
            <option value="IBM Plex Sans">IBM Plex Sans</option>
            <option value="Josefin Sans">Josefin Sans</option>
            <option value="Kanit">Kanit</option>
            <option value="Lato">Lato</option>
            <option value="Montserrat">Montserrat</option>
            <option value="Noto Sans">Noto Sans</option>
            <option value="Open Sans">Open Sans</option>
            <option value="PT Sans">PT Sans</option>
            <option value="Quicksand">Quicksand</option>
            <option value="Raleway">Raleway</option>
            <option value="Roboto">Roboto</option>
            <option value="Source Sans Pro">Source Sans Pro</option>
            <option value="Ubuntu">Ubuntu</option>
            <option value="Varela Round">Varela Round</option>
            {/* 他のゴシック体フォントを追加 */}
          </optgroup>
        </select>
      </div>
      <div className="form-group">
        <label>File Format:</label>
        <select value={fileFormat} onChange={handleFileFormatChange}>
          <option value="png">PNG</option>
          <option value="jpg">JPG</option>
          <option value="svg">SVG</option>
          <option value="webp">Webp</option>
        </select>
      </div>
      <div className="form-group">
        <label>Image Size:</label>
        <select value={imageSize} onChange={handleImageSizeChange}>
          <option value="64">64x64</option>
          <option value="128">128x128</option>
          <option value="256">256x256</option>
          <option value="360">360x360</option>
          <option value="512">512x512</option>
        </select>
      </div>
      {preview && (
        <div className="preview-container">
          <img className="preview-image" src={preview} alt="Preview Icon" />
          <button className="save-button" onClick={handleSaveImage}>
            Download
          </button>
        </div>
      )}
      <p className="copy">Created by 2023.Yu</p>
    </div>
  );
};

export default App;
