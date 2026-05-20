(function () {
  'use strict';

  const STEP_NAMES = ['Sobre ti', 'La persona homenajeada', 'El encargo'];
  const TOTAL_STEPS = STEP_NAMES.length;

  const form = document.querySelector('[data-quiz-form]');
  if (!form) return;

  const steps = Array.from(form.querySelectorAll('.form-step'));
  const backBtn = form.querySelector('[data-quiz-back]');
  const nextBtn = form.querySelector('[data-quiz-next]');
  const progressFill = document.querySelector('[data-progress-fill]');
  const progressCount = document.querySelector('[data-progress-count]');
  const progressName = document.querySelector('[data-progress-name]');

  let currentStep = 0;

  function getFields(stepEl) {
    return Array.from(stepEl.querySelectorAll('input, textarea, select')).filter(function (field) {
      return !field.disabled && field.type !== 'file';
    });
  }

  function isStepValid(stepIndex, report) {
    const stepEl = steps[stepIndex];
    const fields = getFields(stepEl);

    for (let i = 0; i < fields.length; i++) {
      if (!fields[i].checkValidity()) {
        if (report) fields[i].reportValidity();
        return false;
      }
    }

    if (stepIndex === 1) {
      const uploadInput = document.getElementById('fotos-referencia');
      if (uploadInput && uploadInput.files.length === 0) {
        if (report) {
          uploadInput.setCustomValidity('Sube al menos una foto de referencia.');
          uploadInput.reportValidity();
        }
        return false;
      }
      if (uploadInput) uploadInput.setCustomValidity('');
    }

    return true;
  }

  function validateStep(stepIndex) {
    return isStepValid(stepIndex, true);
  }

  function updateProgress() {
    const stepNumber = currentStep + 1;
    const percent = (stepNumber / TOTAL_STEPS) * 100;

    if (progressFill) progressFill.style.width = percent + '%';
    if (progressCount) progressCount.textContent = 'Paso ' + stepNumber + ' de ' + TOTAL_STEPS;
    if (progressName) progressName.textContent = STEP_NAMES[currentStep];

    if (backBtn) backBtn.hidden = currentStep === 0;
    updateNextButton();
  }

  function updateNextButton() {
    if (!nextBtn) return;

    const onLastStep = currentStep === TOTAL_STEPS - 1;
    const lastStepReady = onLastStep && isStepValid(currentStep, false);

    if (onLastStep) {
      nextBtn.textContent = lastStepReady ? 'Enviar solicitud' : 'Continuar';
      nextBtn.disabled = !lastStepReady;
      nextBtn.setAttribute('aria-disabled', lastStepReady ? 'false' : 'true');
    } else {
      nextBtn.textContent = 'Continuar';
      nextBtn.disabled = false;
      nextBtn.setAttribute('aria-disabled', 'false');
    }
  }

  function showStep(index) {
    steps.forEach(function (step, i) {
      const isActive = i === index;
      step.classList.toggle('is-active', isActive);
      step.hidden = !isActive;
    });
    currentStep = index;
    updateProgress();

    const firstField = steps[index].querySelector('input, textarea, select');
    if (firstField) firstField.focus({ preventScroll: true });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (!validateStep(currentStep)) return;

      if (currentStep < TOTAL_STEPS - 1) {
        showStep(currentStep + 1);
        return;
      }

      for (let i = 0; i < steps.length; i++) {
        if (!isStepValid(i, true)) {
          showStep(i);
          return;
        }
      }

      form.requestSubmit();
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', function () {
      if (currentStep > 0) showStep(currentStep - 1);
    });
  }

  form.addEventListener('input', updateNextButton);
  form.addEventListener('change', updateNextButton);

  form.addEventListener('submit', function (e) {
    for (let i = 0; i < steps.length; i++) {
      if (!isStepValid(i, true)) {
        e.preventDefault();
        showStep(i);
        return;
      }
    }
  });

  showStep(0);

  /* Multi-image upload preview */
  const uploadInput = document.getElementById('fotos-referencia');
  const previewGrid = document.getElementById('upload-preview');
  const uploadZone = document.getElementById('upload-zone');
  const uploadCount = document.getElementById('upload-count');

  if (uploadInput && previewGrid) {
    let selectedFiles = [];

    function renderPreviews() {
      previewGrid.innerHTML = '';
      selectedFiles.forEach(function (file, index) {
        const url = URL.createObjectURL(file);
        const item = document.createElement('div');
        item.className = 'upload-thumb';
        item.innerHTML =
          '<img src="' + url + '" alt="Referencia ' + (index + 1) + '" />' +
          '<button type="button" class="upload-remove" data-index="' + index + '" aria-label="Quitar imagen">×</button>';
        previewGrid.appendChild(item);
      });

      if (uploadCount) {
        const n = selectedFiles.length;
        uploadCount.textContent = n === 0
          ? 'Ninguna foto seleccionada'
          : n + ' foto' + (n === 1 ? '' : 's') + ' seleccionada' + (n === 1 ? '' : 's');
        uploadCount.classList.toggle('upload-count--ok', n >= 4);
      }

      if (uploadZone) {
        uploadZone.classList.toggle('has-files', selectedFiles.length > 0);
      }

      uploadInput.setCustomValidity('');
      updateNextButton();
    }

    function syncInput() {
      const dt = new DataTransfer();
      selectedFiles.forEach(function (f) { dt.items.add(f); });
      uploadInput.files = dt.files;
    }

    uploadInput.addEventListener('change', function () {
      selectedFiles = Array.from(uploadInput.files);
      renderPreviews();
    });

    previewGrid.addEventListener('click', function (e) {
      const btn = e.target.closest('.upload-remove');
      if (!btn) return;
      const idx = parseInt(btn.dataset.index, 10);
      selectedFiles.splice(idx, 1);
      syncInput();
      renderPreviews();
    });

    if (uploadZone) {
      uploadZone.addEventListener('dragover', function (e) {
        e.preventDefault();
        uploadZone.classList.add('is-dragover');
      });
      uploadZone.addEventListener('dragleave', function () {
        uploadZone.classList.remove('is-dragover');
      });
      uploadZone.addEventListener('drop', function (e) {
        e.preventDefault();
        uploadZone.classList.remove('is-dragover');
        const incoming = Array.from(e.dataTransfer.files).filter(function (f) {
          return f.type.startsWith('image/');
        });
        selectedFiles = selectedFiles.concat(incoming);
        syncInput();
        renderPreviews();
      });
    }
  }
})();
