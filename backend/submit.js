async function submitForm(event) {
    event.preventDefault();

    const formElement = event.target;
    const fileInput = document.getElementById('file-upload');
    if (!fileInput.files.length) {
        alert('Please upload your research paper (PDF)');
        return;
    }

    const formData = new FormData();
    formData.append('name', document.getElementById('student-name').value);
    formData.append('studentId', document.getElementById('student-id').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('department', document.getElementById('department').value);
    formData.append('university', document.getElementById('university-name').value);
    formData.append('paperTitle', document.getElementById('paper-title').value);
    formData.append('abstract', document.getElementById('abstract').value);
    formData.append('keywords', document.getElementById('keywords').value);
    formData.append('paper', fileInput.files[0]);  // Append the selected PDF file

    try {
        const response = await fetch('http://localhost:5000/submit', {
            method: 'POST',
            body: formData  // no content-type header here
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('success-modal').classList.remove('hidden');
            document.getElementById('submission-date').innerText = new Date().toLocaleString();
            document.getElementById('submission-id').innerText = data._id || 'N/A';
            formElement.reset();
        } else {
            alert('Failed to submit the form');
        }
    } catch (error) {
        console.error('Error submitting:', error);
        alert('Server error');
    }
}
