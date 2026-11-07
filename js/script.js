const btnVoluntario = document.querySelector('.botao-voluntario');
if (btnVoluntario) {
	btnVoluntario.addEventListener('mouseover', () => {
		btnVoluntario.style.backgroundColor = '#4CAF50';
	});
}

if (btnVoluntario) {
    btnVoluntario.addEventListener('mouseout', () => {
        btnVoluntario.style.backgroundColor = 'var(--paper)';
    });
}

document.addEventListener('DOMContentLoaded', () => {
			const scrollButton = document.querySelector('.seta-rolagem');
			const volunteerForm = document.querySelector('#inscricao-voluntario');
			const formFeedback = document.querySelector('#retorno-inscricao');

			if (!scrollButton) return;

			const goToBottom = () => {
				window.scrollTo({
					top: document.documentElement.scrollHeight,
					behavior: 'smooth'
				});
			};

			scrollButton.addEventListener('click', goToBottom);
			scrollButton.addEventListener('keydown', (event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault();
					goToBottom();
				}
			});

			if (!volunteerForm || !formFeedback) return;

			const submitButton = volunteerForm.querySelector('button[type="submit"]');
			submitButton.disabled = false;
			const interestOptions = [...volunteerForm.querySelectorAll('input[name="areas"]')];
			interestOptions.forEach((option) => {
				option.addEventListener('change', () => interestOptions[0].setCustomValidity(''));
			});
			volunteerForm.addEventListener('submit', (event) => {
				if (!interestOptions.some((option) => option.checked)) {
					interestOptions[0].setCustomValidity('Escolha pelo menos uma área de interesse.');
					interestOptions[0].reportValidity();
					return;
				}

				event.preventDefault();
				formFeedback.textContent = 'A ficha está preenchida, mas ainda não foi enviada. O cadastro precisa ser conectado a um serviço de recebimento.';
			});
		});

const form = document.getElementById('formulario-voluntario');
const nomeInput = document.getElementById('nome-voluntario'); // Corrigido 'voluntario'
const emailInput = document.getElementById('email-voluntario');
const telefoneInput = document.getElementById('telefone-voluntario');
const cidadeInput = document.getElementById('cidade-voluntario');
const sobreInput = document.getElementById('motivacao-voluntario');

// const de salvamento
const nomeSalvo = localStorage.getItem('formNome');
const emailSalvo = localStorage.getItem('formEmail');
const telefoneSalvo = localStorage.getItem('formTelefone');
const cidadeSalva = localStorage.getItem('formCidade');
const sobreSalvo = localStorage.getItem('formSobre');

if (nomeSalvo) {
    nomeInput.value = nomeSalvo;
}

if (emailSalvo) {
    emailInput.value = emailSalvo;
}

if (telefoneSalvo) {
    telefoneInput.value = telefoneSalvo;
}

if (cidadeSalva) {
    cidadeInput.value = cidadeSalva;
}

if (sobreSalvo) {
    sobreInput.value = sobreSalvo;
}

nomeInput.addEventListener('input', function() {
    localStorage.setItem('formNome', nomeInput.value);
});

emailInput.addEventListener('input', function() {
    localStorage.setItem('formEmail', emailInput.value);
});

telefoneInput.addEventListener('input', function() {
    localStorage.setItem('formTelefone', telefoneInput.value);
});

cidadeInput.addEventListener('input', function() {
    localStorage.setItem('formCidade', cidadeInput.value);
});

sobreInput.addEventListener('input', function() {
    localStorage.setItem('formSobre', sobreInput.value);
});