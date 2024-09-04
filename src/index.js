// Access the camera
const video = document.getElementById('video');

navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => {
        console.error("Error accessing the camera: ", err);
    });

// Capture the image from the video
const captureButton = document.getElementById('capture');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const textElement = document.getElementById('text');

captureButton.addEventListener('click', () => {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Preprocess the image (grayscale conversion)
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < imageData.data.length; i += 4) {
        const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;

        imageData.data[i] = avg; // Red channel
        imageData.data[i + 1] = avg; // Green channel
        imageData.data[i + 2] = avg; // Blue channel
    }

    context.putImageData(imageData, 0, 0);

    const processedImageData = canvas.toDataURL('image/png');

    // Recognize text from the captured image using Tesseract.js
    Tesseract.recognize(
        processedImageData,
        'eng',
        {
            logger: m => console.log(m),
            tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
            psm: Tesseract.PSM.SINGLE_BLOCK
        }
    ).then(({ data: { text } }) => {
        textElement.textContent = text;
    }).catch(err => {
        console.error("Error recognizing text: ", err);
        textElement.textContent = "Error recognizing text.";
    });
});