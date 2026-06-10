import FormContainer from "@/components/FormContainer";
import ActionButton from "@/components/ActionButton";

export default function KidsPage() {
  return (
    <FormContainer>
      <h2 style={{ marginBottom: "20px", color: "black" }}>Kids</h2>

      <ActionButton label="One" />
      <ActionButton label="Two" />
      <ActionButton label="Three" />
    </FormContainer>
  );
}
