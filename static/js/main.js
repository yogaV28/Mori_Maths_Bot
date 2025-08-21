document.addEventListener('DOMContentLoaded', () => {
    const cameraBtn = document.getElementById('camera-btn');
    const sendBtn = document.getElementById('send-btn');
    const imageUpload = document.getElementById('image-upload');
    const solutionContainer = document.getElementById('solution-container');
    const solutionText = document.getElementById('solution-text');
    const loading = document.getElementById('loading');
    const problemInput = document.getElementById('problem-input');
    
    async function sendMessage(inputData, inputType) {
        if (!inputData) return;
        
        loading.style.display = 'flex';
        solutionContainer.style.display = 'none';

        try {
            const response = await fetch('/solve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ [inputType]: inputData })
            });

            const data = await response.json();
            
            loading.style.display = 'none';
            solutionContainer.style.display = 'block';

            if (data.solution) {
                const converter = new showdown.Converter();
                let html = converter.makeHtml(data.solution);
                solutionText.innerHTML = html;
                renderMathInElement(solutionText, {
                    delimiters: [
                        {left: '$$', right: '$$', display: true},
                        {left: '$', right: '$', display: false}
                    ]
                });
            } else {
                solutionText.textContent = 'Error: ' + data.error;
            }
        } catch (error) {
            console.error('Fetch error:', error);
            loading.style.display = 'none';
            solutionContainer.style.display = 'block';
            solutionText.textContent = 'An error occurred. Please try again.';
        }
    }

    cameraBtn.addEventListener('click', () => {
        imageUpload.click();
    });

    sendBtn.addEventListener('click', () => {
        sendMessage(problemInput.value, 'text');
        problemInput.value = '';
    });

    problemInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage(problemInput.value, 'text');
            problemInput.value = '';
        }
    });

    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            sendMessage(e.target.result, 'image');
        };
        reader.readAsDataURL(file);
    });

    function renderMathInElement(element) {
        if (!window.katex) {
            console.error("KaTeX not loaded.");
            return;
        }

        const text = element.innerHTML;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = text.replace(/\$(.*?)\$/g, (match, p1) => `\\(\\text{${p1}}\\)`).replace(/\$\$(.*?)\$\$/g, (match, p1) => `\\[\\text{${p1}}\\]`);
        element.innerHTML = tempDiv.innerHTML;
    
        element.querySelectorAll('i').forEach(i => i.remove());
    
        element.innerHTML = element.innerHTML.replace(/\\\[(.*?)\\\]/g, (match, p1) => {
            try {
                return katex.renderToString(p1, { displayMode: true, throwOnError: false });
            } catch (e) {
                return match;
            }
        }).replace(/\\\((.*?)\\\)/g, (match, p1) => {
            try {
                return katex.renderToString(p1, { displayMode: false, throwOnError: false });
            } catch (e) {
                return match;
            }
        });
    }
});