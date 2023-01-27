import { LoadingIndicator } from "components/loading-indicator";

export const TrainingInProgress = () => {
  return (
    <div className="text-center">
      Training in progress... Feel free to hang around here or grab a coffee
      ☕️. This page will update when complete
      <div className="mt-8 flex justify-center">
        <LoadingIndicator />
      </div>
    </div>
  );
};
