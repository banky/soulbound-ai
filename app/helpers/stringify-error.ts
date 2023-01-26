export const stringifyError = (error: unknown) => {
  if (typeof error === "string") {
    return error;
  } else if (error instanceof Error) {
    return error.message;
  } else {
    return "An unexpected error occured";
  }
};
