import { useEffect, useState } from "react";
import CountryList from "country-list-with-dial-code-and-flag";
import Button from "../ui/Button";
import { useUserStore } from "../../store/userStore";
import { useRoleStore } from "../../store/roleStore";
import { useBranchStore } from "../../store/branchStore";

export default function EditUserForm({ userId, onClose }) {
  const { updateUser, getUserById, users, fetchUsers, error } = useUserStore(
    (state) => state
  );
  const { branches, fetchBranches } = useBranchStore((state) => state);
  const { roles, fetchRoles } = useRoleStore((s) => s);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    countryCode: "+91",
    branchId: "",
    roleId: "",
    designation: "",
    headId: "",
    managerId: "",
    userType: "",
  });

  const [errorValidation, setErrorValidation] = useState("");
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    setCountries(CountryList.getAll());
  }, []);

  useEffect(() => {
    fetchRoles();
    fetchBranches();
    fetchUsers();
  }, [fetchRoles, fetchBranches, fetchUsers]);

  useEffect(() => {
    if (userId) {
      const user = getUserById(userId);
      if (user) {
        setFormData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          countryCode: user.countryCode || "+91",
          branchId: user.branchId || "",
          roleId: user.roleId || "",
          designation: user.designation || "",
          headId: user.headId || "",
          managerId: user.managerId || "",
          userType: user.isHead ? "head" : user.isManager ? "manager" : "",
        });
      }
    }
  }, [userId, getUserById]);

  useEffect(() => {
    if (error) setErrorValidation(error);
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.branchId ||
      !formData.roleId
    ) {
      setErrorValidation("Please fill all required fields.");
      return;
    }

    try {
      await updateUser(userId, formData);
      setErrorValidation("");
      if (onClose) onClose();
    } catch (err) {
      setErrorValidation("Failed to update user: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorValidation && (
        <p className="text-red-500 text-sm">{errorValidation}</p>
      )}

      <h3 className="font-semibold text-gray-700 border-b pb-1">
        Basic Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border px-3 py-2 rounded-md w-full"
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="border px-3 py-2 rounded-md w-full"
        />
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
        <select
          value={formData.countryCode}
          onChange={(e) =>
            setFormData({ ...formData, countryCode: e.target.value })
          }
          className="border px-3 py-2 rounded-md"
        >
          <option value="">Country</option>
          {countries.map((c) => (
            <option key={c.code} value={c.dial_code}>
              {c.flag} {c.name} ({c.dial_code})
            </option>
          ))}
        </select>
        <input
          type="tel"
          placeholder="Phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="border px-3 py-2 rounded-md col-span-2 md:col-span-3"
        />
      </div>

      <h3 className="font-semibold text-gray-700 border-b pb-1">
        Work Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          value={formData.branchId}
          onChange={(e) =>
            setFormData({ ...formData, branchId: e.target.value })
          }
          className="border px-3 py-2 rounded-md w-full"
        >
          <option value="">Select Branch</option>
          {branches?.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>

        <select
          value={formData.roleId}
          onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
          className="border px-3 py-2 rounded-md w-full"
        >
          <option value="">Select Role</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>

      <input
        type="text"
        placeholder="Designation (Optional)"
        value={formData.designation}
        onChange={(e) =>
          setFormData({ ...formData, designation: e.target.value })
        }
        className="border px-3 py-2 rounded-md w-full"
      />

      <div className="flex gap-4 col-span-2">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="userType"
            value="head"
            checked={formData.userType === "head"}
            onChange={(e) =>
              setFormData({
                ...formData,
                userType: e.target.value,
                managerId: "",
              })
            }
          />
          Head
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="userType"
            value="manager"
            checked={formData.userType === "manager"}
            onChange={(e) =>
              setFormData({ ...formData, userType: e.target.value, headId: "" })
            }
          />
          Manager
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {formData.userType !== "head" && formData.userType !== "manager" && (
          <select
            value={formData.headId}
            onChange={(e) =>
              setFormData({ ...formData, headId: e.target.value })
            }
            className="border px-3 py-2 rounded-md w-full"
          >
            <option value="">Select Head</option>
            {users
              ?.filter((u) => u.isHead)
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
          </select>
        )}

        {formData.userType !== "manager" && (
          <select
            value={formData.managerId}
            onChange={(e) =>
              setFormData({ ...formData, managerId: e.target.value })
            }
            className="border px-3 py-2 rounded-md w-full"
          >
            <option value="">Select Manager</option>
            {users
              ?.filter((u) => u.isManager)
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
          </select>
        )}
      </div>

      <div className="flex justify-center mt-4">
        <Button
          type="submit"
          className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-md"
        >
          Update User
        </Button>
      </div>
    </form>
  );
}
