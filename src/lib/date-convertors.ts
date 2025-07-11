
export const formatDate = (input: Date | string | number): string => {
  try {
    const date = input instanceof Date ? input : new Date(input);

    if (isNaN(date.getTime())) {
      throw new Error("Invalid date input");
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "NA";
  }
};