/**
 * Vastraa - Accessible Form Validation Module
 * Provides field-level schema checks and updates ARIA error states.
 */

export const VALIDATION_RULES = {
  required: (val) => Boolean(val && val.toString().trim().length > 0),
  email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val).trim()),
  phone: (val) => /^(\+91[\s\-]?)?[6789]\d{9}$/.test(String(val).replace(/[\s\-]/g, "")),
  pinCode: (val) => /^[1-9][0-9]{5}$/.test(String(val).trim()),
  minLength: (min) => (val) => Boolean(val && val.toString().trim().length >= min)
};

/**
 * Validate a single HTML form field and render accessible error feedback.
 */
export function validateField(inputElement, rules = {}) {
  if (!inputElement) return true;

  const value = inputElement.value ? inputElement.value.trim() : "";
  const name = inputElement.name || inputElement.id || "Field";
  let errorMessage = "";

  if (rules.required && !VALIDATION_RULES.required(value)) {
    errorMessage = `${rules.label || name} is required.`;
  } else if (value && rules.email && !VALIDATION_RULES.email(value)) {
    errorMessage = "Please enter a valid email address.";
  } else if (value && rules.phone && !VALIDATION_RULES.phone(value)) {
    errorMessage = "Please enter a valid 10-digit Indian phone number.";
  } else if (value && rules.pinCode && !VALIDATION_RULES.pinCode(value)) {
    errorMessage = "Please enter a valid 6-digit Indian PIN code.";
  } else if (value && rules.minLength && !VALIDATION_RULES.minLength(rules.minLength)(value)) {
    errorMessage = `${rules.label || name} must be at least ${rules.minLength} characters.`;
  }

  // Find or create error container
  const errorContainerId = `${inputElement.id || inputElement.name}-error`;
  let errorElement = document.getElementById(errorContainerId);

  if (errorMessage) {
    inputElement.setAttribute("aria-invalid", "true");
    inputElement.classList.add("is-invalid");

    if (!errorElement) {
      errorElement = document.createElement("span");
      errorElement.id = errorContainerId;
      errorElement.className = "form-error-msg";
      errorElement.setAttribute("role", "alert");
      inputElement.parentElement.appendChild(errorElement);
    }
    errorElement.textContent = errorMessage;
    inputElement.setAttribute("aria-describedby", errorContainerId);
    return false;
  } else {
    inputElement.removeAttribute("aria-invalid");
    inputElement.classList.remove("is-invalid");
    if (errorElement) {
      errorElement.textContent = "";
    }
    return true;
  }
}

/**
 * Validate an entire HTML form based on a schema mapping
 */
export function validateForm(formElement, schema) {
  let isValid = true;
  let firstInvalidField = null;

  for (const [fieldName, rules] of Object.entries(schema)) {
    const input = formElement.elements[fieldName];
    if (input) {
      const fieldValid = validateField(input, rules);
      if (!fieldValid) {
        isValid = false;
        if (!firstInvalidField) {
          firstInvalidField = input;
        }
      }
    }
  }

  if (firstInvalidField) {
    firstInvalidField.focus();
  }

  return isValid;
}
