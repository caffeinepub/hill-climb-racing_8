import Array "mo:core/Array";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Iter "mo:core/Iter";

actor {
  type ScoreEntry = {
    playerName : Text;
    distance : Nat;
    coins : Nat;
  };

  module ScoreEntry {
    public func compareByDistanceDesc(entry1 : ScoreEntry, entry2 : ScoreEntry) : Order.Order {
      if (entry1.distance > entry2.distance) { #less } else if (entry1.distance < entry2.distance) { #greater } else {
        Text.compare(entry1.playerName, entry2.playerName);
      };
    };
  };

  var scores : [ScoreEntry] = [];

  public shared ({ caller }) func submitScore(playerName : Text, distance : Nat, coins : Nat) : async () {
    let newEntry : ScoreEntry = {
      playerName;
      distance;
      coins;
    };

    scores := scores.concat([newEntry]).sort(ScoreEntry.compareByDistanceDesc);
  };

  public query ({ caller }) func getTopScores() : async [ScoreEntry] {
    scores.values().take(10).toArray();
  };
};
