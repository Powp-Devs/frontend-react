import React from "react";
import "@/styles/stepModal.css";

export interface StepInfo {
  label: string;
  description?: string;
}

interface StepModalProps {
  isOpen: boolean;
  title: string;
  steps: StepInfo[];
  activeStep: number;
  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  disableBack?: boolean;
  disableNext?: boolean;
  disableSubmit?: boolean;
  isSubmitting?: boolean;
  submitLabel?: string;
  children: React.ReactNode;
}

const StepModal: React.FC<StepModalProps> = ({
  isOpen,
  title,
  steps,
  activeStep,
  onClose,
  onBack,
  onNext,
  onSubmit,
  disableBack,
  disableNext,
  disableSubmit,
  isSubmitting,
  submitLabel = "Salvar",
  children,
}) => {
  if (!isOpen) {
    return null;
  }

  const isLastStep = activeStep === steps.length - 1;

  return (
    <div className="modal-show" role="dialog" aria-modal="true">
      <div className="modal-content step-modal">
        <div className="modal-header">
          <div>
            <h2>{title}</h2>
            <p className="step-title">
              Etapa {activeStep + 1} de {steps.length}: {steps[activeStep]?.label}
            </p>
          </div>
          <button className="close-modal" onClick={onClose} aria-label="Fechar">
            &times;
          </button>
        </div>

        <div className="breadcrumbs" aria-label="Etapas do formulário">
          {steps.map((step, index) => (
            <React.Fragment key={step.label}>
              <span className={`breadcrumb-item ${index === activeStep ? "active" : ""} ${index < activeStep ? "completed" : ""}`}>
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <span className="breadcrumb-separator" aria-hidden="true">&gt;</span>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="modal-body">{children}</div>

        <div className="step-modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onBack}
            disabled={disableBack || activeStep === 0}
          >
            Voltar
          </button>

          {!isLastStep && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={onNext}
              disabled={disableNext}
            >
              Avançar
            </button>
          )}

          {isLastStep && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={onSubmit}
              disabled={disableSubmit || isSubmitting}
            >
              {isSubmitting ? "Salvando..." : submitLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepModal;
