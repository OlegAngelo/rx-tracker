const fileInput = document.getElementById('fileInput');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const textElement = document.getElementById('text');

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();

        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                // Resize canvas to the uploaded image's size
                canvas.width = img.width;
                canvas.height = img.height;

                // Draw the image onto the canvas
                context.drawImage(img, 0, 0);

                // Optional: Preprocess the image (e.g., convert to grayscale, binarize)
                preprocessImage(context, canvas);

                const processedImageData = canvas.toDataURL('image/png');

                // Recognize text using Tesseract.js
                Tesseract.recognize(
                    processedImageData,
                    'eng',
                    {
                        logger: m => console.log(m)
                    }
                ).then(({ data: { text } }) => {
                    textElement.textContent = text;
                }).catch(err => {
                    console.error("Error recognizing text: ", err);
                    textElement.textContent = "Error recognizing text.";
                });
            }
            img.src = e.target.result;
        };

        reader.readAsDataURL(file);
    }
});

function preprocessImage(context, canvas) {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Convert to grayscale
    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;     // red
        data[i + 1] = avg; // green
        data[i + 2] = avg; // blue
    }

    // Apply Otsu's Binarization (for more accuracy, consider using a specialized library or tool)
    const threshold = 128; // Simple fixed thresholding for demonstration
    for (let i = 0; i < data.length; i += 4) {
        const brightness = data[i];
        const value = brightness > threshold ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = value; // Apply the threshold
    }

    context.putImageData(imageData, 0, 0);
}