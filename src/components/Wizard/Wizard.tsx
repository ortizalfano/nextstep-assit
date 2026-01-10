import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Step0TypeSelection } from './Step0TypeSelection';
import { Step1Discovery } from './Step1Discovery';
import { Step2Detail } from './Step2Detail';
import { Step2FeatureDetail } from './Step2FeatureDetail';
import { Step3Empathy } from './Step3Empathy';
import { Step3FeatureEvidence } from './Step3FeatureEvidence';
import { Step4Summary } from './Step4Summary';

type WizardData = {
    reportType?: 'bug' | 'feature';
    // Bug Fields
    category?: string;
    subject?: string;
    module?: string;
    frequency?: string;
    scope?: string;
    currentBehavior?: string;
    expectedBehavior?: string;
    stepsToReproduce?: string[];
    // Feature Fields
    problemStatement?: string;
    proposedSolution?: string;
    businessValue?: string;
    priority?: number;
    exampleLink?: string;
    // Shared
    severity?: number;
    files?: File[];
};

interface WizardProps {
    userRole?: 'admin' | 'manager' | 'user';
    onTicketCreated?: () => void;
}

export const Wizard: React.FC<WizardProps> = ({ userRole = 'user', onTicketCreated }) => {
    const [step, setStep] = useState(0); // Start at 0
    const [formData, setFormData] = useState<WizardData>({});

    const nextStep = (data?: Partial<WizardData>) => {
        let newData = { ...formData };
        if (data) {
            newData = { ...newData, ...data };
            setFormData(newData);
        }

        // Routing Logic
        if (step === 0 && newData.reportType === 'feature') {
            setStep(20); // Feature Detail
        } else if (step === 20) {
            setStep(30); // Feature Detail -> Feature Evidence
        } else if (step === 30) {
            setStep(4); // Feature Evidence -> Summary
        } else {
            setStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        if (step === 20) {
            setStep(0); // Back to Type Selection
        } else if (step === 30) {
            setStep(20); // Back to Feature Detail
        } else if (step === 4 && formData.reportType === 'feature') {
            setStep(30); // Back to Feature Evidence
        } else {
            setStep(prev => prev - 1);
        }
    };

    return (
        <div className="w-full h-full flex items-center justify-center p-4">
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                >
                    {step === 0 && (
                        <Step0TypeSelection
                            onSelect={(type) => nextStep({ reportType: type })}
                            compact={userRole !== 'user'}
                        />
                    )}
                    {step === 1 && (
                        <Step1Discovery onSelect={(category) => nextStep({ category })} />
                    )}
                    {step === 2 && (
                        <Step2Detail onNext={nextStep} onBack={prevStep} data={formData} />
                    )}
                    {step === 20 && (
                        <Step2FeatureDetail onNext={nextStep} onBack={prevStep} data={formData} />
                    )}
                    {step === 3 && (
                        <Step3Empathy onNext={nextStep} onBack={prevStep} />
                    )}
                    {step === 30 && (
                        <Step3FeatureEvidence onNext={nextStep} onBack={prevStep} data={formData} />
                    )}
                    {step === 4 && (
                        <Step4Summary
                            data={formData}
                            onReset={() => { setFormData({}); setStep(0); }}
                            onSuccess={onTicketCreated}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
