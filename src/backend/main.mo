import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Nat "mo:core/Nat";

actor {
  // Custom Types
  type Entry = {
    id : Nat;
    date : Text; // ISO format YYYY-MM-DD
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

  type Summary = {
    totalInvest : Float;
    totalReceived : Float;
    totalProfit : Float;
    profitPercentage : Float;
    averageDailyProfitPercentage : Float;
  };

  // Persistent State
  var nextEntryId = 0;
  let entries = Map.empty<Nat, Entry>();

  public shared ({ caller }) func addEntry(date : Text, investAmount : Float, receivedAmount : Float) : async Entry {
    let entry : Entry = {
      id = nextEntryId;
      date;
      investAmount;
      receivedAmount;
      createdAt = Time.now();
    };
    entries.add(nextEntryId, entry);
    nextEntryId += 1;
    entry;
  };

  public query ({ caller }) func getEntries() : async [Entry] {
    entries.values().toArray().sort(Entry.compareByDate);
  };

  public shared ({ caller }) func deleteEntry(id : Nat) : async Bool {
    if (entries.containsKey(id)) {
      entries.remove(id);
      true;
    } else {
      Runtime.trap("Entry not found");
    };
  };

  func max(floatValues : [Float]) : Float {
    if (floatValues.size() == 0) { return 0 };
    var maxVal = floatValues[0];
    for (value in floatValues.values()) {
      if (value > maxVal) { maxVal := value };
    };
    maxVal;
  };

  func min(floatValues : [Float]) : Float {
    if (floatValues.size() == 0) { return 0 };
    var minVal = floatValues[0];
    for (value in floatValues.values()) {
      if (value < minVal) { minVal := value };
    };
    minVal;
  };

  public query ({ caller }) func getSummary() : async Summary {
    let allEntries = entries.values().toArray();

    var totalInvest : Float = 0;
    var totalReceived : Float = 0;
    var totalProfit : Float = 0;
    var profitPercentage : Float = 0;
    var averageDailyProfitPercentage : Float = 0;

    let validEntries = allEntries.filter(
      func(entry) { entry.investAmount > 0 }
    );

    let validInvestAmounts = validEntries.map(
      func(entry) { entry.investAmount }
    );

    let validReceivedAmounts = validEntries.map(
      func(entry) { entry.receivedAmount }
    );

    let profitPercentages = validEntries.map(
      func(entry) {
        ((entry.receivedAmount - entry.investAmount) / entry.investAmount) * 100;
      }
    );

    switch (validEntries.size()) {
      case (0) {};
      case (count) {
        totalInvest := validInvestAmounts.foldLeft(0.0, Float.add);
        totalReceived := validReceivedAmounts.foldLeft(0.0, Float.add);
        totalProfit := totalReceived - totalInvest;
        profitPercentage := if (totalInvest > 0) {
          (totalProfit / totalInvest) * 100;
        } else {
          0.0;
        };
        averageDailyProfitPercentage := if (count > 0) {
          profitPercentages.foldLeft(0.0, Float.add) / count.toFloat();
        } else {
          0.0;
        };
      };
    };

    {
      totalInvest;
      totalReceived;
      totalProfit;
      profitPercentage;
      averageDailyProfitPercentage;
    };
  };
};
