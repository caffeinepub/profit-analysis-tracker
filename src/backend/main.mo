import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Nat32 "mo:core/Nat32";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Order "mo:core/Order";
import Nat "mo:core/Nat";


import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Use with clause to enable upgrade migration

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  type UserId = Principal;
  type EntryId = Nat;
  type DateString = Text;
  type YearMonthString = Text;

  public type UserProfile = {
    username : Text;
    email : ?Text;
    passwordHash : ?Text;
    createdAt : Int;
    lastLoginAt : ?Int;
  };

  type Entry = {
    id : EntryId;
    date : DateString;
    investAmount : Float;
    receivedAmount : Float;
    createdAt : Int;
  };

  module Entry {
    public func compare(entry1 : Entry, entry2 : Entry) : Order.Order {
      Nat.compare(entry1.id, entry2.id);
    };
    public func compareByDate(entry1 : Entry, entry2 : Entry) : Order.Order {
      Text.compare(entry2.date, entry1.date);
    };
  };

  type DashboardStats = {
    totalInvested : Float;
    totalReceived : Float;
    totalProfit : Float;
    profitPercent : Float;
    avgDailyProfit : Float;
  };

  type MonthlySummary = {
    yearMonth : YearMonthString;
    totalInvested : Float;
    totalReceived : Float;
    totalProfit : Float;
    profitPercent : Float;
    avgDailyProfit : Float;
    entryCount : Nat;
  };

  type UserState = {
    var nextEntryId : EntryId;
    entries : Map.Map<EntryId, Entry>;
  };

  // State
  var userStates = Map.empty<UserId, UserState>();
  var userProfiles = Map.empty<UserId, UserProfile>();
  var usernameToPrincipal = Map.empty<Text, Principal>();

  // Helper functions
  func getUserState(caller : Principal) : UserState {
    switch (userStates.get(caller)) {
      case (null) {
        let newUserState : UserState = {
          var nextEntryId = 0;
          entries = Map.empty<EntryId, Entry>();
        };
        userStates.add(caller, newUserState);
        newUserState;
      };
      case (?state) { state };
    };
  };

  func validEntries(entries : Map.Map<EntryId, Entry>) : [Entry] {
    entries.values().toArray().filter(
      func(entry) {
        entry.investAmount > 0;
      }
    );
  };

  func getYearMonth(date : DateString) : YearMonthString {
    let parts = date.split(#char('-')).toArray();
    if (parts.size() == 3) {
      parts[0] # "-" # parts[1];
    } else {
      "";
    };
  };

  func getFloatSum(array : [Float]) : Float {
    if (array.size() == 0) { return 0.0 };
    array.foldLeft(0.0, Float.add);
  };

  func getFloatAvg(array : [Float]) : Float {
    switch (array.size()) {
      case (0) { 0.0 };
      case (count) {
        array.foldLeft(0.0, Float.add) / count.toFloat();
      };
    };
  };

  func findUserByEmail(email : Text) : ?(Principal, UserProfile) {
    var result : ?(Principal, UserProfile) = null;
    userProfiles.entries().find(
      func((principal, profile)) {
        switch ((profile.email, result)) {
          case (?storedEmail, null) {
            storedEmail == email;
          };
          case (_) { false };
        };
      }
    );
  };

  // Required profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // User registration - accessible to all (including guests) to allow new user signup
  public shared ({ caller }) func registerUser(username : Text) : async () {
    let userId = caller;
    if (usernameToPrincipal.containsKey(username)) {
      Runtime.trap("Username already taken");
    };

    let userProfile : UserProfile = {
      username;
      email = null;
      passwordHash = null;
      createdAt = Time.now();
      lastLoginAt = null;
    };
    userProfiles.add(userId, userProfile);
    usernameToPrincipal.add(username, userId);
    userStates.add(userId, {
      var nextEntryId = 0;
      entries = Map.empty<EntryId, Entry>();
    });
  };

  // New User registration with email and password (accessible to authenticated users)
  public shared ({ caller }) func registerUserWithEmailPassword(username : Text, email : Text, passwordHash : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can register with email and password");
    };

    let userId = caller;
    if (usernameToPrincipal.containsKey(username)) {
      Runtime.trap("Username already taken");
    };

    let existingUser = findUserByEmail(email);
    if (existingUser != null) {
      Runtime.trap("Email already in use");
    };

    let newUserProfile : UserProfile = {
      username;
      email = ?email;
      passwordHash = ?passwordHash;
      createdAt = Time.now();
      lastLoginAt = null;
    };

    userProfiles.add(userId, newUserProfile);
    usernameToPrincipal.add(username, userId);
    userStates.add(userId, {
      var nextEntryId = 0;
      entries = Map.empty<EntryId, Entry>();
    });
  };

  // Verify email and password hash
  public query ({ caller }) func verifyEmailPassword(email : Text, passwordHash : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can verify credentials");
    };

    switch (findUserByEmail(email)) {
      case (null) { false };
      case (?(_principal, profile)) {
        switch (profile.passwordHash) {
          case (?storedHash) { storedHash == passwordHash };
          case (null) { false };
        };
      };
    };
  };

  // Entry management - all require user permission
  public shared ({ caller }) func addEntry(date : DateString, investAmount : Float, receivedAmount : Float) : async Entry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add entries");
    };

    let userState = getUserState(caller);

    let entry : Entry = {
      id = userState.nextEntryId;
      date;
      investAmount;
      receivedAmount;
      createdAt = Time.now();
    };

    userState.entries.add(userState.nextEntryId, entry);
    userState.nextEntryId += 1;
    entry;
  };

  public query ({ caller }) func getEntries() : async [Entry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view entries");
    };

    let userState = getUserState(caller);
    userState.entries.values().toArray().sort(Entry.compareByDate);
  };

  public shared ({ caller }) func deleteEntry(id : EntryId) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete entries");
    };

    let userState = getUserState(caller);

    if (userState.entries.containsKey(id)) {
      userState.entries.remove(id);
      true;
    } else {
      Runtime.trap("Entry not found");
    };
  };

  public query ({ caller }) func getMonthlySummaries() : async [MonthlySummary] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view monthly summaries");
    };

    let userState = getUserState(caller);
    let entriesArray = validEntries(userState.entries);

    let yearMonthToEntries = entriesArray.foldLeft(Map.empty<YearMonthString, [Entry]>(), func(acc, entry) {
      let yearMonth = getYearMonth(entry.date);
      switch (acc.get(yearMonth)) {
        case (null) {
          acc.add(yearMonth, [entry]);
        };
        case (?existing) {
          acc.add(yearMonth, existing.concat([entry]));
        };
      };
      acc;
    });

    yearMonthToEntries.entries().toArray().reverse().map(
      func((yearMonth, entries)) {
        let investAmounts = entries.map(
          func(entry) { entry.investAmount }
        );
        let receivedAmounts = entries.map(
          func(entry) { entry.receivedAmount }
        );
        let profits = entries.map(
          func(entry) { entry.receivedAmount - entry.investAmount }
        );

        let profitPercents = entries.map(
          func(entry) {
            ((entry.receivedAmount - entry.investAmount) / entry.investAmount) * 100;
          }
        );

        let totalInvest = getFloatSum(investAmounts);
        let totalReceived = getFloatSum(receivedAmounts);
        let totalProfit = getFloatSum(profits);
        let entryCount = entries.size();

        {
          yearMonth = yearMonth : Text;
          totalInvested = totalInvest : Float;
          totalReceived = totalReceived : Float;
          totalProfit = totalProfit : Float;
          profitPercent = if (totalInvest > 0) {
            (totalProfit / totalInvest) * 100;
          } else {
            0.0;
          };
          avgDailyProfit = getFloatAvg(profitPercents : [Float]);
          entryCount = entryCount : Nat;
        };
      }
    );
  };

  public query ({ caller }) func getDashboardStats() : async DashboardStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view dashboard stats");
    };

    let userState = getUserState(caller);
    let entriesArray = validEntries(userState.entries);

    let investAmounts = entriesArray.map(
      func(entry) { entry.investAmount }
    );
    let receivedAmounts = entriesArray.map(
      func(entry) { entry.receivedAmount }
    );
    let profits = entriesArray.map(
      func(entry) { entry.receivedAmount - entry.investAmount }
    );
    let profitPercents = entriesArray.map(
      func(entry) {
        ((entry.receivedAmount - entry.investAmount) / entry.investAmount) * 100;
      }
    );

    let totalInvest = getFloatSum(investAmounts);
    let totalReceived = getFloatSum(receivedAmounts);
    let totalProfit = getFloatSum(profits);

    {
      totalInvested = totalInvest;
      totalReceived = totalReceived;
      totalProfit = totalProfit;
      profitPercent = if (totalInvest > 0) {
        (totalProfit / totalInvest) * 100;
      } else {
        0.0;
      };
      avgDailyProfit = getFloatAvg(profitPercents);
    };
  };
};
