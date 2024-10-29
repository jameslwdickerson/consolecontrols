document.addEventListener('DOMContentLoaded', () => {
    const requestDeviceButton = document.getElementById('request-device');
    
    requestDeviceButton.addEventListener('click', async () => {
        try {
            const devices = await window.WebHID.getDevices();
            console.log(devices);

            // Example: Request a device
            const device = await window.WebHID.requestDevice();
            console.log('Device requested:', device);

            if (device) {
                await device.open();
                console.log('Device opened:', device);
                // Add your further handling here
            }
        } catch (error) {
            console.error('Error requesting device:', error);
        }
    });
    
    // Function to request connected Stream Decks
    window.electronAPI.getStreamDecks = () => {
        window.electronAPI.send('get-stream-decks');
    };

    // Function to handle the response of connected Stream Decks
    window.electronAPI.onStreamDecksResponse = (callback) => {
        window.electronAPI.on('stream-decks-response', callback);
    };

    // New code for color picker
    const colorPicker = document.createElement('input');
    colorPicker.type = 'color'; // Create a color input
    colorPicker.id = 'color-picker'; // Set an ID for reference
    document.body.appendChild(colorPicker); // Append the color picker to the document body

    colorPicker.addEventListener('input', (event) => {
        const hexColor = event.target.value; // Get the selected hex color
        const rgb = hexToRgb(hexColor); // Convert hex to RGB

        // Send the selected color to the main process for the 4th button
        window.electronAPI.send('set-color-picker', { r: rgb.r, g: rgb.g, b: rgb.b });
    });

    // Utility function to convert hex to RGB
    function hexToRgb(hex) {
        hex = hex.replace(/^#/, ''); // Remove the hash symbol if present
        const bigint = parseInt(hex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;

        return { r, g, b };
    }


    // for adding text to a button
    document.addEventListener('DOMContentLoaded', () => {
        const requestDeviceButton = document.getElementById('request-device');
        
        // Existing code...
    
        // New Code for Stream Decks
    
        // Add event listener for setting text on button 2
        const setTextButton = document.getElementById('set-text-button');
        const textInput = document.getElementById('text-input');
    
    });


    // // Function to set text on button 2
    // document.getElementById('set-text-button').addEventListener('click', () => {
    //     const text = document.getElementById('text-input').value.trim(); // Get the text input and trim whitespace
    //     const buttonIndex = 1; // Set text for button 2 (index 1)
    //     console.log(text, 'renderer')
    //     // Validate that text is not empty
    //     if (text.length === 0) {
    //         alert('Please enter valid text for button 2.'); // Alert user if text is invalid
    //         return; // Exit the function
    //     }
    
    //     window.electronAPI.setText({ buttonIndex, text }); // Send the text to the main process
    // });

        // function setTextOnButton() {
    //     const textInput = document.getElementById('textInput').value; // Get text from input field
    //     if (textInput) {
    //         window.electronAPI.setText(textInput); // Use the exposed setText method
    //     }
    // }


    // for buttom images
    // const imageInput = document.createElement('input');
    // imageInput.type = 'file'; // File input to select images
    // imageInput.accept = 'image/jpeg'; // Accept only JPEG images
    // document.body.appendChild(imageInput); // Append to body for user to select image

    // const setImageButton = document.createElement('button');
    // setImageButton.textContent = 'Set Image for Button 3';
    // document.body.appendChild(setImageButton); // Append button to set image

    // setImageButton.addEventListener('click', async () => {
    //     const file = imageInput.files[0]; // Get the selected file
    //     if (file) {
    //         const reader = new FileReader();
    //         reader.onload = () => {
    //             const imageBuffer = Buffer.from(reader.result); // Convert result to Buffer
    //             window.electronAPI.setImage(imageBuffer); // Send image buffer to main process
    //         };
    //         reader.readAsArrayBuffer(file); // Read the file as an ArrayBuffer
    //     } else {
    //         alert('Please select an image file first.');
    //     }
    // });
});
