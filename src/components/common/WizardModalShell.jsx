import React from 'react';

/* Shared safe-zone shell for Check-In, Reservation, Enquiry, and Check-Out.
   The sheet is its own layer (z-100) so the master header cannot cover the
   step title, and the footer stays docked under the scrolling body. */
export const WizardModalShell = ({
  title,
  subtitle,
  badgeText,
  isOpen,
  onClose,
  currentStep = 1,
  totalSteps = 2,
  children,
  footerContent,
}) => {
  if (!isOpen) return null;

  const steps = Math.max(1, Number(totalSteps) || 1);
  const step = Math.max(1, Number(currentStep) || 1);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end md:justify-center items-center select-none" data-wizard-shell="true">
      {/* 1. Backdrop Scrim */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
      />

      {/* 2. Modal Body with Strict Safe-Area Insets */}
      <div className="relative w-full max-w-lg h-[92dvh] md:h-auto md:max-h-[88vh] bg-[#F8FAFC] dark:bg-slate-900 rounded-t-[32px] md:rounded-[32px] shadow-2xl flex flex-col overflow-hidden border-t md:border border-slate-200 dark:border-slate-800 animate-slideUp">

        {/* TOP APP BAR (Never blocked by master header) */}
        <div className="px-5 pt-4 pb-3 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex-none">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-2 md:hidden" />

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                  {title}
                </h3>
                {badgeText && (
                  <span className="px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-[10px] font-black uppercase tracking-wider border border-teal-200 dark:border-teal-800">
                    {badgeText}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-[11px] text-slate-500 font-semibold mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center text-sm font-bold active:scale-90 transition"
            >
              ✕
            </button>
          </div>

          {/* Stepper Dots (if multi-step) */}
          {steps > 1 && (
            <div className="grid gap-2 mt-2.5" style={{gridTemplateColumns:`repeat(${Math.min(steps, 6)}, minmax(0, 1fr))`}}>
              {Array.from({length: steps}, (_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all ${step >= i + 1 ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
              ))}
            </div>
          )}
        </div>

        {/* SCROLLABLE INTERMEDIATE CONTENT ZONE */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {children}
        </div>

        {/* DOCKED ERGONOMIC FOOTER */}
        <div className="p-4 pt-3 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 flex-none pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {footerContent}
        </div>

      </div>
    </div>
  );
};
