import { Fragment, useState } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = "Sélectionner...",
    required = false
}) {
    const [query, setQuery] = useState('');

    const selectedOption = options.find((opt) => opt.id === value) || null;

    const filteredOptions =
        query === ''
            ? options
            : options.filter((opt) =>
                opt.name.toLowerCase().includes(query.toLowerCase()) ||
                (opt.code && opt.code.toLowerCase().includes(query.toLowerCase()))
            );

    return (
        <div className="relative">
            <Combobox value={selectedOption} onChange={(val) => onChange(val ? val.id : '')}>
                <div className="relative w-full">
                    <Combobox.Input
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700 outline-none pr-10"
                        displayValue={(opt) => opt ? `${opt.code ? opt.code + ' - ' : ''}${opt.name}` : ''}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={placeholder}
                        required={required && !value}
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <ChevronUpDownIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                        />
                    </Combobox.Button>
                </div>
                <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    afterLeave={() => setQuery('')}
                >
                    <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-2xl shadow-blue-900/10 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {filteredOptions.length === 0 && query !== '' ? (
                            <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                Aucun résultat trouvé.
                            </div>
                        ) : (
                            filteredOptions.map((opt) => (
                                <Combobox.Option
                                    key={opt.id}
                                    className={({ active }) =>
                                        `relative cursor-pointer select-none py-3 pl-10 pr-4 transition-colors ${active ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                                        }`
                                    }
                                    value={opt}
                                >
                                    {({ selected, active }) => (
                                        <>
                                            <span className={`block truncate ${selected ? 'font-bold' : 'font-medium'}`}>
                                                {opt.code ? `📍 ${opt.code} - ` : ''}{opt.name}
                                            </span>
                                            {selected ? (
                                                <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-blue-600' : 'text-blue-600'}`}>
                                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                </span>
                                            ) : null}
                                        </>
                                    )}
                                </Combobox.Option>
                            ))
                        )}
                    </Combobox.Options>
                </Transition>
            </Combobox>
        </div>
    );
}
