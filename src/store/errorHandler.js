import NotificationMessage from "../components/Notification";

const errorHandler = (error) => {
  const notification = new NotificationMessage({
    message: error.message,
    wrapperOfElement: document.body,
    duration: 3000,
    type: 'error'
  });
  notification.show();
};

export default errorHandler;