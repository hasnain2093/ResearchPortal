
    document.addEventListener('DOMContentLoaded', function() {
        const form = document.getElementById('submission-form');
        const uploadArea = document.getElementById('upload-area');
        const fileUpload = document.getElementById('file-upload');
        const fileInfo = document.getElementById('file-info');
        const fileName = document.getElementById('file-name');
        const fileSize = document.getElementById('file-size');
        const removeFile = document.getElementById('remove-file');
        const progressBar = document.getElementById('progress-bar');
        const abstract = document.getElementById('abstract');
        const wordCount = document.getElementById('word-count');
        const successModal = document.getElementById('success-modal');
        const closeModal = document.getElementById('close-modal');
        const submissionDate = document.getElementById('submission-date');
        
        // Set current date for submission
        const now = new Date();
        submissionDate.textContent = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
        
        // Word count for abstract
        abstract.addEventListener('input', function() {
            const words = this.value.trim().split(/\s+/).filter(Boolean).length;
            wordCount.textContent = words;
            
            if (words > 300) {
                wordCount.classList.add('text-red-600');
            } else {
                wordCount.classList.remove('text-red-600');
            }
        });
        
        // Drag and drop functionality
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, unhighlight, false);
        });
        
        function highlight() {
            uploadArea.classList.add('dragover');
        }
        
        function unhighlight() {
            uploadArea.classList.remove('dragover');
        }
        
        uploadArea.addEventListener('drop', handleDrop, false);
        
        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            if (files.length) {
                handleFiles(files);
            }
        }
        
        // File upload handling
        uploadArea.addEventListener('click', function() {
            fileUpload.click();
        });
        
        fileUpload.addEventListener('change', function() {
            if (this.files.length) {
                handleFiles(this.files);
            }
        });
        
        function handleFiles(files) {
            const file = files[0];
            
            // Check if file is PDF
            if (file.type !== 'application/pdf') {
                alert('Please upload a PDF file only.');
                return;
            }
            
            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert('File size exceeds 10MB limit.');
                return;
            }
            
            // Display file info
            fileName.textContent = file.name;
            fileSize.textContent = formatFileSize(file.size);
            fileInfo.classList.remove('hidden');
            
            // Simulate upload progress
            simulateUpload();
        }
        
        function formatFileSize(bytes) {
            if (bytes < 1024) return bytes + ' bytes';
            else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
            else return (bytes / 1048576).toFixed(1) + ' MB';
        }
        
        function simulateUpload() {
            let width = 0;
            const interval = setInterval(() => {
                if (width >= 100) {
                    clearInterval(interval);
                } else {
                    width += 5;
                    progressBar.style.width = width + '%';
                }
            }, 100);
        }
        
        // Remove file
        removeFile.addEventListener('click', function() {
            fileUpload.value = '';
            fileInfo.classList.add('hidden');
            progressBar.style.width = '0%';
        });
        
        // Form submission
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            // Validate form
            if (!validateForm()) {
                return;
            }

            // Collect form data
            const formData = new FormData();
            formData.append('studentName', document.getElementById('student-name').value);
            formData.append('studentId', document.getElementById('student-id').value);
            formData.append('email', document.getElementById('email').value);
            formData.append('department', document.getElementById('department').value);
            formData.append('universityName', document.getElementById('university-name').value);
            formData.append('paperTitle', document.getElementById('paper-title').value);
            formData.append('abstract', document.getElementById('abstract').value);
            formData.append('keywords', document.getElementById('keywords').value);
            formData.append('paper', fileUpload.files[0]);

            // Show loading/progress (optional)
            document.getElementById('submit-btn').disabled = true;
            document.getElementById('submit-btn').textContent = 'Submitting...';

            fetch('http://127.0.0.1:5000/submit', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) throw new Error('Submission failed');
                return response.json();
            })
            .then(data => {
                successModal.classList.remove('hidden');
                document.getElementById('submission-id').textContent = data.submissionId || ('SUB-' + Math.floor(10000 + Math.random() * 90000));
                form.reset();
                fileInfo.classList.add('hidden');
                progressBar.style.width = '0%';
            })
            .catch(err => {
                alert('Submission failed. Please try again.');
            })
            .finally(() => {
                document.getElementById('submit-btn').disabled = false;
                document.getElementById('submit-btn').textContent = 'Submit Paper';
            });
        });
        
        function validateForm() {
            // Check if file is uploaded
            if (!fileUpload.files.length) {
                alert('Please upload your research paper.');
                return false;
            }
            
            // Check abstract word count
            const words = abstract.value.trim().split(/\s+/).filter(Boolean).length;
            if (words > 300) {
                alert('Abstract exceeds 300 word limit.');
                return false;
            }
            
            return true;
        }
        
        // Close modal
        closeModal.addEventListener('click', function() {
            successModal.classList.add('hidden');
            form.reset();
            fileInfo.classList.add('hidden');
            progressBar.style.width = '0%';
        });
    });
