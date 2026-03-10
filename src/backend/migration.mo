import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  // Define old UserProfile without email and passwordHash
  type OldUserProfile = {
    username : Text;
    createdAt : Int;
    lastLoginAt : ?Int;
  };

  // Old Actor type
  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  // New UserProfile with email and passwordHash
  type NewUserProfile = {
    username : Text;
    email : ?Text;
    passwordHash : ?Text;
    createdAt : Int;
    lastLoginAt : ?Int;
  };

  // New Actor type with updated UserProfile
  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
  };

  // Migration function to transform old actor state to new actor state
  public func run(old : OldActor) : NewActor {
    let updatedUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_principal, oldProfile) {
        {
          username = oldProfile.username;
          email = null;
          passwordHash = null;
          createdAt = oldProfile.createdAt;
          lastLoginAt = oldProfile.lastLoginAt;
        };
      }
    );
    { userProfiles = updatedUserProfiles };
  };
};
