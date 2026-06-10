import FormContainer from "@/components/FormContainer";
import ActionButton from "@/components/ActionButton";

export default function AdminPage() {
  return (
    <FormContainer>
      <h2 style={{ marginBottom: "20px", color: "black" }}>Admin</h2>

      <ActionButton label="One" />
      <ActionButton label="Two" />
      <ActionButton label="Three" />
    </FormContainer>
  );
}
