import { FormEvent, useRef, useState } from "react";
import {
  FORM_ACTIONS,
  useFormQuote,
  useFormQuoteDispatch,
} from "../FormContext";
import "./FormQuoteRequest.css";
import { useToast } from "./ToastProvider";
import { validateFormQuote } from "../libs";
import { Field, FormQuoteErrors } from "../types/Product";

const FormQuoteRequest = () => {
  const [errors, setErrors] = useState<FormQuoteErrors>({});
  const toast = useToast();
  const FormQuoteDispatch = useFormQuoteDispatch();
  const FormQuote = useFormQuote();

  const refs = {
    email: useRef<HTMLInputElement>(null),
    name: useRef<HTMLInputElement>(null),
    title: useRef<HTMLInputElement>(null),
    message: useRef<HTMLTextAreaElement>(null),
  } satisfies Record<
    Field,
    React.RefObject<HTMLInputElement | HTMLTextAreaElement>
  >;

  const handleFormQuoteChange = (field: string, value: string) => {
    FormQuoteDispatch({
      type: FORM_ACTIONS.FIELD_MODIFY,
      payload: { field, text: value },
    });
  };
  const handleFormQuoteSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validateFormQuote(FormQuote);
    setErrors(errs);

    const order: Field[] = ["email", "title", "name", "message"];
    const first = order.find((k) => !!errs[k]);

    if (first) {
      refs[first]?.current?.focus();
      toast.error("Revisa los campos marcados y vuelve a intentar.");
      return;
    }
    toast.success("¡Solicitud enviada! (No realmente jeje)");
    FormQuoteDispatch({
      type: FORM_ACTIONS.FORM_SENT,
      payload: { field: "", text: "" },
    });
  };

  return (
    <form className="form-group" noValidate onSubmit={(e) => handleFormQuoteSubmit(e)}>
      <label className="form-label">Tu Correo electronico</label>
      <input
        type="email"
        name="email"
        value={FormQuote.email}
        className={`form-input ${errors.email && 'is-invalid' }`}
        onChange={(e) => handleFormQuoteChange(e.target.name, e.target.value)}
      />
      {errors.email && <p className="input-error">{errors.email}</p>}
      <label className="form-label">Titulo</label>
      <input
        name="title"
        value={FormQuote.title}
        className={`form-input ${errors.title && 'is-invalid' }`}
        onChange={(e) => handleFormQuoteChange(e.target.name, e.target.value)}
      />
      {errors.title && <p className="input-error">{errors.title}</p>}
      <label className="form-label">Nombre completo</label>
      <input
        name="name"
        value={FormQuote.name}
        className={`form-input ${errors.name && 'is-invalid' }`}
        onChange={(e) => handleFormQuoteChange(e.target.name, e.target.value)}
      />
      {errors.name && <p className="input-error">{errors.name}</p>}
      <label className="form-label">Mensaje</label>
      <textarea
        name="message"
        value={FormQuote.message}
        className={`form-textarea ${errors.message && 'is-invalid' }`}
        onChange={(e) => handleFormQuoteChange(e.target.name, e.target.value)}
      />
      {errors.message && <p className="input-error">{errors.message}</p>}
      <button
        className="btn btn-secondary cta1"
        type="submit"
      >
        <span className="material-icons">email</span>Solicitar cotización
        oficial
      </button>
    </form>
  );
};

export default FormQuoteRequest;
