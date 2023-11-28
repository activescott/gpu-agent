import { BootstrapIcon } from "@/pkgs/client/components/BootstrapIcon"

// TODO: Implement backend logic for this to save to DB or something.
//       Another option is to implement auth and only allow auth people to downvote and immediately kill listings.
export function AccuracyFeedbackSurvey() {
  return (
    <span className="fs-6 fw-lighter fst-italic">
      Is this accurate?
      <a className="" target="_blank">
        <BootstrapIcon icon="hand-thumbs-up" size="xs" />
      </a>{" "}
      /
      <a className="" target="_blank">
        <BootstrapIcon icon="hand-thumbs-down" size="xs" />
      </a>
    </span>
  )
}
