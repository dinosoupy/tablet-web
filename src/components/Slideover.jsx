import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export const Slideover = ({ open, setOpen }) => {
    return (
        <Transition.Root show={open} as={Fragment}>
            <div className="absolute inset-y-0 z-10 w-full">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex max-w-full pr-10">
                    <Transition.Child
                        as={Fragment}
                        enter="transform transition ease-in-out duration-500 sm:duration-700"
                        enterFrom="-translate-x-full"
                        enterTo="translate-x-0"
                        leave="transform transition ease-in-out duration-500 sm:duration-700"
                        leaveFrom="translate-x-0"
                        leaveTo="-translate-x-full"
                    >
                        <div className="pointer-events-auto w-screen max-w-md">
                            <div className="flex h-full flex-col overflow-y-auto bg-white py-6 shadow-xl">
                                <div className="px-4 sm:px-6">
                                    <div className="flex items-start justify-between">
                                        <h1 className="text-base font-semibold leading-6 text-gray-900">
                                            Panel title
                                        </h1>
                                        <div className="ml-3 flex h-7 items-center">
                                            <button
                                                type="button"
                                                className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                onClick={() => setOpen(false)}
                                            >
                                                <span className="absolute -inset-2.5" />
                                                <span className="sr-only">Close panel</span>
                                                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="relative mt-6 flex-1 px-4 sm:px-6">Your content</div>
                            </div>
                        </div>
                    </Transition.Child>
                </div>
            </div>
        </Transition.Root>
    )
}

export default Slideover
