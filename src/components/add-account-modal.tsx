import { useState } from "react";
import { X, Loader2 } from "lucide-react";

interface AddAccountModalProps {
  onClose: () => void;
  onAdd: (account: { name: string; type: "BANK" | "CARD" }) => void;
}

export function AddAccountModal({
  onClose,
  onAdd,
}: AddAccountModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"BANK" | "CARD">("BANK");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter an account name");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd({
        name: name.trim(),
        type,
      });
      onClose();
    } catch (error) {
      console.error("Failed to add account:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-foreground">Add New Account</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="account-name"
              className="block text-foreground mb-2"
            >
              Account Name
            </label>
            <input
              type="text"
              id="account-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
              placeholder="e.g., Chase Checking, Visa Card"
              required
            />
          </div>

          <div>
            <label
              htmlFor="account-type"
              className="block text-foreground mb-2"
            >
              Account Type
            </label>
            <select
              id="account-type"
              value={type}
              onChange={(e) =>
                setType(e.target.value as "BANK" | "CARD")
              }
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
            >
              <option value="BANK">Bank Account</option>
              <option value="CARD">Credit/Debit Card</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Account"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}