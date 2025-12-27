// Polyfills for React Native and Expo testing environment

// TextEncoder/TextDecoder polyfill
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// fetch polyfill
global.fetch = require('node-fetch');

// Blob polyfill
if (typeof global.Blob === 'undefined') {
  global.Blob = require('node-fetch').Blob;
}

// FormData polyfill
if (typeof global.FormData === 'undefined') {
  global.FormData = require('form-data');
}
