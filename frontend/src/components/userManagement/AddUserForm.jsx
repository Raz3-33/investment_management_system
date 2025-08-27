import { useEffect, useState } from "react";
import CountryList from "country-list-with-dial-code-and-flag";
import Button from "../ui/Button";
import { useUserStore } from "../../store/userStore";
import { useRoleStore } from "../../store/roleStore";
import { useBranchStore } from "../../store/branchStore";
import Modal from "../ui/Modal/Modal";

export default function AddUserForm() {
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
    password: "",
    confirmPassword: "",
  });
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);

  const [errorValidation, setErrorValidation] = useState("");
  const [countries, setCountries] = useState([]);

  const { addUser, error, userAdd, users, fetchUsers } = useUserStore(
    (state) => state
  );
  const { branches, fetchBranches, addBranch } = useBranchStore(
    (state) => state
  );

  const { roles, fetchRoles } = useRoleStore((s) => s);

  useEffect(() => {
    setCountries(CountryList.getAll());
  }, []);

  useEffect(() => {
    if (error) setErrorValidation(error);
  }, [error]);

  useEffect(() => {
    fetchRoles();
    fetchBranches();
    fetchUsers();
  }, [fetchRoles, fetchBranches, fetchUsers, userAdd]);

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

    if (formData.password !== formData.confirmPassword) {
      setErrorValidation("Passwords do not match.");
      return;
    }

    try {
      await addUser(formData);
      setFormData({
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
        password: "",
        confirmPassword: "",
      });
      setErrorValidation("");
    } catch (err) {
      setErrorValidation("Failed to add user: " + err.message);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorValidation && (
          <p className="text-red-500 text-sm">{errorValidation}</p>
        )}

        {/* Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border px-3 py-2 rounded-md w-full"
          />

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="border px-3 py-2 rounded-md w-full"
          />

          {/* Phone (Country Code + Phone) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Phone</label>
            <div className="grid grid-cols-12 gap-2">
              <select
                value={formData.countryCode}
                onChange={(e) =>
                  setFormData({ ...formData, countryCode: e.target.value })
                }
                className="col-span-3 sm:col-span-2 md:col-span-4 border px-3 py-2 rounded-md"
              >
                <option value="">Code</option>
                {countries.map((c) => (
                  <option key={c.code} value={c.dial_code}>
                    {c.flag || c.code} {c.name} ({c.dial_code})
                  </option>
                ))}
              </select>

              <input
                type="tel"
                placeholder="Phone number"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="col-span-7 sm:col-span-8 md:col-span-8 border px-3 py-2 rounded-md"
              />
            </div>
          </div>

          {/* Branch */}
          <select
            value={formData.branchId}
            onChange={(e) => {
              if (e.target.value === "add_new") {
                setIsBranchModalOpen(true);
                return;
              }
              setFormData({ ...formData, branchId: e.target.value });
            }}
            className="md:col-span-2 border px-3 py-2 rounded-md w-full"
          >
            <option value="">Select Branch</option>
            {branches?.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
            <option value="add_new" className="text-blue-600 font-semibold">
              ➕ Add New Branch
            </option>
          </select>

          {/* Role */}
          <select
            value={formData.roleId}
            onChange={(e) =>
              setFormData({ ...formData, roleId: e.target.value })
            }
            className="md:col-span-2 border px-3 py-2 rounded-md w-full"
          >
            <option value="">Select Role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>

          {/* Designation */}
          <input
            type="text"
            placeholder="Designation (Optional)"
            value={formData.designation}
            onChange={(e) =>
              setFormData({ ...formData, designation: e.target.value })
            }
            className="md:col-span-2 border px-3 py-2 rounded-md w-full"
          />

          {/* User type */}
          <div className="md:col-span-2 flex flex-wrap gap-6">
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
                  setFormData({
                    ...formData,
                    userType: e.target.value,
                    headId: "",
                  })
                }
              />
              Manager
            </label>
          </div>

          {/* Head Dropdown */}
          {formData.userType !== "head" && (
            <select
              value={formData.headId}
              onChange={(e) =>
                setFormData({ ...formData, headId: e.target.value })
              }
              className="md:col-span-2 border px-3 py-2 rounded-md w-full"
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

          {/* Manager Dropdown */}
          {formData.userType !== "manager" && (
            <select
              value={formData.managerId}
              onChange={(e) =>
                setFormData({ ...formData, managerId: e.target.value })
              }
              className="md:col-span-2 border px-3 py-2 rounded-md w-full"
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
          {/* <div className="grid grid-cols-1 md:grid-cols-1">
          <h3 className="font-semibold text-gray-700 mt-4">
            Login Credentials
          </h3>
        </div> */}

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="border px-3 py-2 rounded-md w-full"
          />

          {/* Confirm Password */}
          <input
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            className="border px-3 py-2 rounded-md w-full"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            className="bg-blue-600 text-white hover:bg-blue-700 transition duration-300 w-40 h-11"
          >
            Add User
          </Button>
        </div>
      </form>

      <Modal
        isOpen={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
        title="Create Branch"
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Branch Name"
            value={formData.branchName || ""}
            onChange={(e) =>
              setFormData({ ...formData, branchName: e.target.value })
            }
            className="border px-3 py-2 rounded-md w-full"
          />
          <input
            type="text"
            placeholder="Location"
            value={formData.branchLocation || ""}
            onChange={(e) =>
              setFormData({ ...formData, branchLocation: e.target.value })
            }
            className="border px-3 py-2 rounded-md w-full"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              onClick={async () => {
                if (!formData.branchName || !formData.branchLocation) {
                  setErrorValidation("Branch name and location are required.");
                  return;
                }

                try {
                  const newBranch = await addBranch({
                    name: formData.branchName,
                    location: formData.branchLocation,
                  });

                  await fetchBranches();
                  // setFormData({
                  //   ...formData,
                  //   branchId: newBranch.id,
                  //   branchName: "",
                  //   branchLocation: "",
                  // });
                  setIsBranchModalOpen(false);
                } catch (err) {
                  setErrorValidation("Failed to add branch: " + err.message);
                }
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
