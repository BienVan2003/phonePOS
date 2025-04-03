function Validator(formSelector) {
    var _this = this;
    var formRules = {};
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var validatorRules = {
        required: function (value) {
            return value ? undefined : 'Vui lòng nhập trường này';
        },
        email: function (value) {
            var regex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            return regex.test(value) ? undefined : 'Vui lòng nhập đúng email';
        },
        min: function (min) {
            return function (value) {
                return value.length >= min ? undefined : `Vui lòng nhập ít nhất ${min} kí tự`;
            }
        },
        max: function (max) {
            return function (value) {
                return value.length >= max ? undefined : `Vui lòng chỉ nhập tối đa ${max} kí tự`;
            }
        },
        comfirm: function (nameInput) {
            return (value) => formElement.querySelector(`input[name="${nameInput}"][rules]`).value === value ? undefined : `Mật khẩu không khớp. Vui lòng nhập lại!`;
        }
    };
    //form element
    var formElement = document.querySelector(formSelector);

    if (formElement) {
        var inputs = formElement.querySelectorAll('[name][rules]');

        for (var input of inputs) {
            //setting rules function for formRules object with defind { inputName: funcion [rules]{} }
            var rules = input.getAttribute('rules').split('|');
            for (var rule of rules) {
                var ruleFunc = validatorRules[rule];
                if (rule.includes(':')) {
                    var ruleInfo = rule.split(':');
                    rule = ruleInfo[0];
                    ruleFunc = validatorRules[rule](ruleInfo[1]);
                }
                if (rule.includes('/')) {
                    var ruleInfo = rule.split('/');
                    rule = ruleInfo[0];
                    ruleFunc = validatorRules[rule](ruleInfo[1]);
                }
                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc);
                }
                else {
                    formRules[input.name] = [ruleFunc];
                }
            }

            // Check event blur, change... of the input
            input.onblur = handleValidate;
            input.oninput = handleClearError;
        }

        ////define function validate
        // validate and show error message
        function handleValidate(event) {
            var rules = formRules[event.target.name];
            var errorMessage;

            for (rule of rules) {
                errorMessage = rule(event.target.value);
                if (errorMessage) break;
            }

            // show error message if has errors
            if (errorMessage) {
                var formGroup = getParent(event.target, '.form-group');
                if (formGroup) {
                    formGroup.classList.add('invalid');

                    var formMessage = formGroup.querySelector('.form-message');
                    if (formMessage) {
                        formMessage.innerText = errorMessage;
                    }
                }
            }
            return !errorMessage;
        }

        // clear error message
        function handleClearError(event) {
            var formGroup = getParent(event.target, '.form-group');
            if (formGroup) {
                if (formGroup.classList.contains('invalid')) {
                    formGroup.classList.remove('invalid');
                    var formMessage = formGroup.querySelector('.form-message');
                    if (formMessage) {
                        formMessage.innerText = '';
                    }
                }
            }
        }

        // event submit of form
        formElement.onsubmit = (event) => {
            event.preventDefault();

            var isvalid = true;
            for (var input of inputs) {
                if (!handleValidate({ target: input })) {
                    isvalid = false;
                }
            }

            if (isvalid) {
                if (typeof _this.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]');
                    var formValues = Array.from(enableInputs).reduce((values, input) => {

                        switch (input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            case 'checkbox':
                                if (!input.matches(':checked')) {
                                    values[input.name] = '';
                                    return values;
                                }
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                }
                                values[input.name].push(input.value);
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                        }

                        return values;
                    }, {});

                    // Callbacks onSubmit and return data of the form

                    _this.onSubmit(formValues);
                }
                else {
                    formElement.submit();
                }
            }
        }
    }
}