struct ChurchId {
    pub id: i32,
}

struct Church {
    id: ChurchId,
    name: String,
    address: String,
    phone1: String,
    phone2: Option<String>,
    email: Option<String>,
    created_at: i64,
    modified_at: i64,
}

struct ChurchMemberId {
    pub id: i32,
}

struct ChurchMember {
    id: ChurchMemberId,
    name: String,
    email: Option<String>,
    address: String,
    phone1: String,
    phone2: Option<String>,

    church_id: ChurchId,

    created_at: i64,
    modified_at: i64,
}

struct FundTypeId {
    pub id: i32,
}

struct FundsType {
    id: FundTypeId,
    name: String,
    description: Option<String>,
    created_at: i64,
    modified_at: i64,
}

struct ChurchMemberFundsId {
    pub id: i32,
}

struct ChurchMemberFunds {
    id: ChurchMemberFundsId,
    member_id: ChurchMemberId,
    amount: f64,
    fund_type_id: FundTypeId,

    created_at: i64,
    modified_at: i64,
}
