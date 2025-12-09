import React from 'react';

function Input(props) {
        return (
                <div className={`${props.wrapperClass || "mb-1"}`}>
                        <label className={`block text-black-700 ${props.labelClass || "font-medium"}`}>{props.label}</label>
                        <input 
                                type={props.type} 
                                placeholder={props.placeholder}
                                name={props.name} 
                                value={props.value}
                                className={`${props.className}`}
                                onChange={props.onChange} 
                                accept={props.accept}
                                readOnly={props.readOnly}
                        />
                </div>
        );
};

export default Input;