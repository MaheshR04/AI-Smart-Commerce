import { CheckCircle2, Circle, Truck, PackageCheck, Hourglass, Loader2 } from 'lucide-react';

export const TrackOrder = ({ orderStatus }) => {
  // Define milestones and statuses order mapping
  const steps = [
    { label: 'Pending', status: 'Pending', icon: Hourglass },
    { label: 'Confirmed', status: 'Confirmed', icon: CheckCircle2 },
    { label: 'Processing', status: 'Processing', icon: Loader2 },
    { label: 'Shipped', status: 'Shipped', icon: Truck },
    { label: 'Delivered', status: 'Delivered', icon: PackageCheck },
  ];

  // Get index of active status to decide colors mapping
  const getActiveStepIndex = (status) => {
    switch (status) {
      case 'Pending':
        return 0;
      case 'Confirmed':
        return 1;
      case 'Processing':
        return 2;
      case 'Shipped':
        return 3;
      case 'Delivered':
        return 4;
      case 'Cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const activeIndex = getActiveStepIndex(orderStatus);

  if (orderStatus === 'Cancelled') {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 text-xs text-red-600 font-semibold">
        <Circle className="w-5 h-5 fill-red-200 text-red-500 flex-shrink-0" />
        <span>This order was cancelled. Stock counts have been restored.</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-5 sm:p-6 space-y-4">
      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Visual Order Progress Timeline</h4>
      
      {/* Horizonal pipeline bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-2 relative">
        {steps.map((step, idx) => {
          const isCompleted = idx < activeIndex;
          const isActive = idx === activeIndex;
          const isFuture = idx > activeIndex;
          const StepIcon = step.icon;

          return (
            <div key={idx} className="flex sm:flex-col items-center gap-3 sm:gap-2 flex-1 w-full relative group">
              
              {/* Connector line between steps (Desktop) */}
              {idx < steps.length - 1 && (
                <div
                  className={`hidden sm:block absolute top-4 left-[60%] right-[-40%] h-0.5 z-0 ${
                    idx < activeIndex ? 'bg-sky-500' : 'bg-slate-200'
                  }`}
                ></div>
              )}

              {/* Step indicator node */}
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-sky-500 border-sky-500 text-white shadow-md shadow-sky-100'
                    : isActive
                    ? 'bg-white border-sky-500 text-sky-500 font-bold scale-110 shadow-lg shadow-sky-100'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <StepIcon className={`w-4 h-4 ${isActive ? 'animate-spin' : ''}`} />
                )}
              </div>

              {/* Title label */}
              <div className="text-left sm:text-center">
                <p
                  className={`text-xs font-bold transition-colors ${
                    isActive ? 'text-sky-600' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </p>
                {isActive && (
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-sky-500 block">
                    Current Milestone
                  </span>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrackOrder;
