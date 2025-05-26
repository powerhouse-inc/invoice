import { Select } from "@powerhousedao/document-engineering/ui";
import { Status } from "document-models/invoice/index.js";
import { Icon } from "@powerhousedao/design-system";
import { ArrowBigRight, FileCheck  } from "lucide-react";
import { useState } from "react";

interface SelectFieldProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

const STATUS_OPTIONS: Status[] = [
  "DRAFT",
  "ISSUED",
  "CANCELLED",
  "ACCEPTED",
  "REJECTED",
  "AWAITINGPAYMENT",
  "PAYMENTSCHEDULED",
  "PAYMENTSENT",
  "PAYMENTISSUE",
  "PAYMENTRECEIVED",
];

function warningIcon() {
  return <Icon name="WarningFill" color="#eb4235" />;
}

function clockIcon() {
  return <FileCheck style={{ width: 24, height: 24, fill: "#475264", color: 'white', padding: 0, margin: 0, borderColor: '#475264' }} />;
}

function checkCircleIcon(color: string) {
  return <FileCheck style={{ width: 24, height: 24, fill: color, color: 'white' }} />;
}

function arrowRightIcon(color: string) {
  return <ArrowBigRight style={{width: 22, height: 22, fill: color, color: color}} />;
}

const STATUS_OPTIONS_MAP = [
  {
    label: "Draft",
    value: "DRAFT",
    icon: () => arrowRightIcon("#1890ff"),
  },
  {
    label: "Issued",
    value: "ISSUED",
    icon: () => arrowRightIcon("#475264"),
  },
  {
    label: "Cancelled",
    value: "CANCELLED",
    icon: warningIcon,
  },
  {
    label: "Accepted",
    value: "ACCEPTED",
    icon: () => checkCircleIcon("#475264"),
  },
  {
    label: "Rejected",
    value: "REJECTED",
    icon: warningIcon,
  },
  {
    label: "Awaiting Payment",
    value: "AWAITINGPAYMENT",
    icon: () => checkCircleIcon("#475264"),
  },
  {
    label: "Payment Scheduled",
    value: "PAYMENTSCHEDULED",
    icon: clockIcon,
  },
  {
    label: "Payment Sent",
    value: "PAYMENTSENT",
    icon: clockIcon,
  },
  {
    label: "Payment Issue",
    value: "PAYMENTISSUE",
    icon: warningIcon,
  },
  {
    label: "Payment Received",
    value: "PAYMENTRECEIVED",
    icon: () => checkCircleIcon("#34a853"),
  },
];

export const SelectField = (props: SelectFieldProps) => {
  const { options, value: status, onChange } = props;
  const [selectKey, setSelectKey] = useState(0);

  // Determine what options to show
  const draftActions = [
    {
      label: "Draft",
      value: "DRAFT",
      icon: () => arrowRightIcon("#1890ff"),
    },
    {
      label: "Issue Invoice",
      value: "ISSUE_INVOICE",
    },
    {
      label: "Cancel Invoice",
      value: "CANCEL_INVOICE",
    },
  ];

  const cancelledActions = [
    {
      label: "Cancelled",
      value: "CANCELLED",
      icon: warningIcon,
    },
    {
      label: "Re-draft Invoice",
      value: "RE_DRAFT_INVOICE",
    },
  ];

  const issuedActions = [
    {
      label: "Issued",
      value: "ISSUED",
      icon: () => arrowRightIcon("#475264"),
    },
    {
      label: "Pay now",
      value: "PAY_NOW",
    },
    {
      label: "Pay later",
      value: "PAY_LATER",
    },
    {
      label: "Batch Payment",
      value: "BATCH_PAYMENT",
    },
    {
      label: "Reject Invoice",
      value: "REJECT_INVOICE",
    },
    {
      label: "Mark as paid",
      value: "MARK_AS_PAID",
    },
  ];

  const paymentScheduledActions = [
    {
      label: "Payment Scheduled",
      value: "PAYMENTSCHEDULED",
      icon: clockIcon,
    },
    {
      label: "Payment Sent",
      value: "PAYMENTSENT",
      icon: clockIcon,
    },
  ];

  const paymentSentActions = [
    {
      label: "Payment Sent",
      value: "PAYMENTSENT",
      icon: clockIcon,
    },
    {
      label: "Payment Returned",
      value: "PAYMENT_RETURNED",
    },
    {
      label: "Report Issue",
      value: "REPORT_ISSUE",
    },
    {
      label: "Mark as paid",
      value: "MARK_AS_PAID",
    },
  ];

  const awaitingPaymentActions = [
    {
      label: "Awaiting Payment",
      value: "AWAITINGPAYMENT",
      icon: () => checkCircleIcon("#475264"),
    },
    {
      label: "Pay now",
      value: "PAY_NOW",
    },
    {
      label: "Mark as paid",
      value: "MARK_AS_PAID",
    },
  ];

  const paymentIssueActions = [
    {
      label: "Payment Issue",
      value: "PAYMENTISSUE",
      icon: warningIcon,
    },
    {
      label: "Re-draft Invoice",
      value: "RE_DRAFT_INVOICE",
    },
  ];

  const paymentReceivedActions = [
    {
      label: "Payment Received",
      value: "PAYMENTRECEIVED",
      icon: () => checkCircleIcon("#34a853"),
    },
    {
      label: "Re-draft Invoice",
      value: "RE_DRAFT_INVOICE",
    },
  ];

  const acceptedActions = [
    {
      label: "Accepted",
      value: "ACCEPTED",
      icon: () => checkCircleIcon("#475264"),
    },
    {
      label: "Pay now",
      value: "PAY_NOW",
    },
    {
      label: "Batch Payment",
      value: "BATCH_PAYMENT",
    },
  ];

  const rejectedActions = [
    {
      label: "Rejected",
      value: "REJECTED",
      icon: warningIcon,
    },
    {
      label: "Re-draft Invoice",
      value: "RE_DRAFT_INVOICE",
    },
  ];

  const optionsToShow = () => {
    switch (status) {
      case "DRAFT":
        return draftActions;
      case "ISSUED":
        return issuedActions;
      case "CANCELLED":
        return cancelledActions;
      case "PAYMENTSCHEDULED":
        return paymentScheduledActions;
      case "PAYMENTSENT":
        return paymentSentActions;
      case "AWAITINGPAYMENT":
        return awaitingPaymentActions;
      case "PAYMENTISSUE":
        return paymentIssueActions;
      case "PAYMENTRECEIVED":
        return paymentReceivedActions;
      case "ACCEPTED":
        return acceptedActions;
      case "REJECTED":
        return rejectedActions;
      default:
        return STATUS_OPTIONS_MAP.filter((opt) => opt.value === status);
    }
  };

  // Stateless handleChange
  const handleChange = (value: string | string[]) => {
    setSelectKey((k) => k + 1);
    if (typeof value === "string") {
      if (status === "DRAFT") {
        if (value === "ISSUE_INVOICE") onChange("ISSUED");
        else if (value === "CANCEL_INVOICE") onChange("CANCELLED");
      } else if (status === "CANCELLED") {
        if (value === "RE_DRAFT_INVOICE") onChange("DRAFT");
      } else if (status === "ISSUED") {
        if (value === "PAY_NOW") onChange("PAYMENTSCHEDULED");
        else if (value === "PAY_LATER") onChange("ACCEPTED");
        else if (value === "BATCH_PAYMENT") onChange("AWAITINGPAYMENT");
        else if (value === "REJECT_INVOICE") onChange("REJECTED");
        else if (value === "MARK_AS_PAID") onChange("PAYMENTRECEIVED");
      } else if (status === "PAYMENTSCHEDULED") {
        if (value === "PAYMENTSENT") onChange("PAYMENTSENT");
      } else if (status === "PAYMENTSENT") {
        if (value === "PAYMENT_RETURNED") onChange("AWAITINGPAYMENT");
        else if (value === "REPORT_ISSUE") onChange("PAYMENTISSUE");
        else if (value === "MARK_AS_PAID") onChange("PAYMENTRECEIVED");
      } else if (status === "AWAITINGPAYMENT") {
        if (value === "PAY_NOW") onChange("PAYMENTSCHEDULED");
        else if (value === "MARK_AS_PAID") onChange("PAYMENTRECEIVED");
      } else if (status === "PAYMENTISSUE") {
        if (value === "RE_DRAFT_INVOICE") onChange("DRAFT");
      } else if (status === "PAYMENTRECEIVED") {
        if (value === "RE_DRAFT_INVOICE") onChange("DRAFT");
      } else if (status === "ACCEPTED") {
        if (value === "PAY_NOW" || value === "BATCH_PAYMENT")
          onChange("AWAITINGPAYMENT");
      } else if (status === "REJECTED") {
        if (value === "RE_DRAFT_INVOICE") onChange("DRAFT");
      }

      // Optionally, handle other statuses/actions here
    }
  };

  return (
    <Select
      key={selectKey}
      style={{ width: 230 }}
      options={optionsToShow()}
      value={status || "DRAFT"}
      onChange={handleChange}
      selectionIcon="checkmark"
      selectionIconPosition="left"
      defaultValue={STATUS_OPTIONS_MAP[0].value} // Draft is the default
    />
  );
};
