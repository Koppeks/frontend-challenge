import { createContext, useContext, useEffect, useReducer } from "react"
import {FormQuote } from "./types/Product"
import { loadFormQuote, saveFormQuote } from "./Storage";

/**
 * Es basicamente lo mismo que el cart context. Es un semi crud de un formulario de contacto.
 * 
 */

const FormQuoteContext = createContext<FormQuote>({email: "", title: "", message:"", name: ""})

type FormQuoteAction = { type: string; payload:{field: string, text: string}}
const defaultDispatch: React.Dispatch<FormQuoteAction> = () => {}
const FormQuoteDispatchContext = createContext<React.Dispatch<{type: string, payload:{field: string, text: string}}>>(defaultDispatch)

export const FORM_ACTIONS = {
  FIELD_MODIFY: "field-modify",
  FORM_SENT: "form-send"
}

export function useFormQuote () {
  return useContext(FormQuoteContext)
}
export function useFormQuoteDispatch () {
  return useContext(FormQuoteDispatchContext)
}

function FormQuoteReducer(state: FormQuote, action: {type:string, payload: {field: string, text: string}}) {
  switch (action.type) {
    case FORM_ACTIONS.FIELD_MODIFY:{
      const {field, text} = action.payload
      return {...state, [field]: text}
    }
    case FORM_ACTIONS.FORM_SENT:{
      const initialValues = {email: "", title: "", message:"", name: ""} 

      //Here should go the sendEmail logic

      return initialValues // Manual state reset
    }
    default:
      return state
  }
}

export const FormQuoteProvider = ({ children } : {children: React.ReactNode}) => {
  const [formQuote, dispatch] = useReducer(FormQuoteReducer, FormQuoteContext, () => loadFormQuote()) // hydrate once
  // persist after every change
  useEffect(() => {
    saveFormQuote(formQuote)
  }, [formQuote])

  return (
    <FormQuoteContext.Provider value={formQuote}>
      <FormQuoteDispatchContext.Provider value={dispatch}>
        {children}
      </FormQuoteDispatchContext.Provider>
    </FormQuoteContext.Provider>
  )
}
